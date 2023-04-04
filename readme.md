## gateway 函数

就是一个自建的网关，处理请求，所以给了最小的配置；但是他需要拥有调用函数的权限


## engine 函数

一个定制简单的函数流水线，需要配置拉取代码的 token。入参格式如下

```json
{
  "commit": "184b341778043c6762a1ff02428ca9592bc8a961",
  "ref": "refs/heads/main",
  "owner": "wss-gitee",
  "clone_url": "https://gitee.com/wss-gitee/blog.git",
  "cloneUrl": "https://gitee.com/wss-gitee/blog.git",
  "provider": "gitee"
}
```

还有层的问题，由于这个是定制的流水线，我清楚流水线安装什么依赖，所以提前准备好了。大家跑自己的项目可以不使用 layer 的配置。
