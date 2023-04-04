const getRawBody = require('raw-body');
const Result = require('./result');

function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

exports.handler = async (req, resp, context) => {
  // 获取请求体
  const body = await new Promise((resolve, reject) => {
    getRawBody(req, function (err, body) {
      err ? reject(err) : resolve(JSON.parse(body.toString()));
    });
  });
  console.log('body:\n', JSON.stringify(body));
  const { headers } = req;
  console.log('headers:\n', JSON.stringify(headers));
  // 验证 gitee 请求
  if (headers['x-gitee-ping'] === 'true') {
    return resp.send(Result.ofSuccess('ping 请求，不做处理'));
  }

  const { WEBHOOK_PASSWORD, REF } = process.env;
  // 验证密钥：这里是用的简单的密码请求
  if (WEBHOOK_PASSWORD !== headers['x-gitee-token']) {
    return resp.send(Result.ofError('密钥验证不通过'));
  }
  // 验证是否触发到了分支
  const ref = `refs/heads/${REF}`;
  if (ref !== body.ref) {
    return resp.send(Result.ofError('分支验证不通过'));
  }
  const {
    before: commit,
    user_name: owner,
    project: { clone_url }
  } = body;

  // 调用函数
  const Fc = require('@alicloud/fc2');
  const { FC_SERVICE_NAME, FC_ACCOUNT_ID, ALIBABA_CLOUD_ACCESS_KEY_ID, ALIBABA_CLOUD_ACCESS_KEY_SECRET, ALIBABA_CLOUD_SECURITY_TOKEN, FC_REGION } = process.env;
  const fcClient = new Fc(FC_ACCOUNT_ID, {
    accessKeyID: ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: ALIBABA_CLOUD_ACCESS_KEY_SECRET,
    securityToken: ALIBABA_CLOUD_SECURITY_TOKEN,
    region: FC_REGION,
    timeout: 60 * 1000,
  });
  const taskId = randomString(32);
  const payload = {
    commit,
    ref,
    owner,
    clone_url,
    cloneUrl: clone_url,
    provider: 'gitee',
  };

  const run = async () => await fcClient.invokeFunction(FC_SERVICE_NAME, 'engine', JSON.stringify(payload), {
    'X-FC-Invocation-Type': 'Async',
    'x-fc-stateful-async-invocation-id': taskId,
  });
  try {
    await run(); // 容易偶现 socket hang，所以重试一次
  } catch(ex) {
    console.error(ex);
    console.log('retry');
    await run();
  }

  resp.send(Result.ofSuccess(payload));
}

