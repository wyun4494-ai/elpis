const md5 = require("md5");

module.exports = (app) => { 
  return async (ctx, next) => { 
    // 校验白名单
    if(app.config?.apiSignVerify?.whiteList?.includes(ctx.path)) {
      return await next()
    }

    // 只对API请求做签名校验
    if (ctx.path.indexOf('/api') < 0 ){
      return await next()
    }

    // 获取请求路径、方法和请求头信息
    const { path, method } = ctx;
    const { headers} = ctx.request;
    // 从请求头中获取签名和时间戳
    const { s_sign: sSign, s_t: st} = headers;

    // 如果是浏览器直接访问（没有签名信息），则跳过验证
    if (!sSign && !st) {
      await next();
      return;
    }

    // 服务端预设的签名密钥
    const signKey = 'elpis-sign-key'
    // 根据时间戳和密钥生成签名
    const signature = md5(`${signKey}_${st}`)
    app.logger.info(`[${method} ${path}] signature: ${signature}`)

    // 验证签名的合法性
    // 条件包括：
    // 1. 必须提供签名(sSign)
    // 2. 必须提供时间戳(st)
    // 3. 生成的签名必须与客户端提供的签名一致
    // 4. 时间戳不能超过10分钟（600 * 1000毫秒）
    if (!sSign || !st || signature !== sSign.toLowerCase() || Date.now() - st > 600 * 1000 ) {
      ctx.status = 200;
      ctx.body = { 
        success: false,
        message: 'signature not correct or api timeout!!',
        code: 445
      };
      // 验证失败时直接返回，不继续执行后续中间件和路由处理
      return;
    }
    // 签名验证通过，继续执行后续中间件
    await next()
  } 
}