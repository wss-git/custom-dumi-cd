const checkout = require('@serverless-cd/checkout').default;
const Engine = require('@serverless-cd/engine').default;

async function handler(body, callback) {
  // 启动 engine
  const cwdPath = `/tmp/${Date.now()}`
  const engine = new Engine({
    cwd: cwdPath, // 代码下载的目录
    logConfig: {
      logPrefix: '/tmp',
      // logLevel: 'debug',
    },
    inputs: {},
    events: {
      onInit: async function (context, logger) {
        logger.info('onInit: checkout start');
        const payload = {
          ...body,
          execDir: cwdPath,
          token: process.env.TOKEN,
        };
        await checkout(payload); // 下载代码
        logger.info('checkout success');
        const { FC_ACCOUNT_ID, ALIBABA_CLOUD_ACCESS_KEY_ID, ALIBABA_CLOUD_ACCESS_KEY_SECRET, ALIBABA_CLOUD_SECURITY_TOKEN } = process.env;
        const steps = [ // 流水线需要运行的命令
          // { run: 'npm install --registry=https://registry.npmmirror.com' },
          { run: 'npm run build' },
          { run: `s config add --AccountID ${FC_ACCOUNT_ID} --SecurityToken ${ALIBABA_CLOUD_SECURITY_TOKEN} --AccessKeyID ${ALIBABA_CLOUD_ACCESS_KEY_ID} --AccessKeySecret ${ALIBABA_CLOUD_ACCESS_KEY_SECRET} -a default -f` },
          { run: 's deploy --use-local -y' },
        ]
        return { steps };
      },
      onCompleted: async function (context, logger) {
        logger.info(`context is: ${JSON.stringify(context)}`);
        logger.info('completed end.');
        callback(null, '');
      },
    },
  });
  await engine.start();
};

exports.handler = handler;