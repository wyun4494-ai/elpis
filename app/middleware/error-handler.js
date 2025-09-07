/**
 *  运行时异常错误处理，兜底使用异常
 * @param {[object]} app koa 实例
 * 
 */
module.exports = (app) => {
  return async (ctx, next) =>{
    try {
      await next();
    } catch (err) {
      // 异常处理
      const { status, message, detail} = err;

      // 记录错误日志，包括完整的错误对象和分解的错误信息
      app.logger.info(JSON.stringify(err));
      app.logger.error('[-- exception --]:', err);
      app.logger.error('[-- exception --]:', status, message, detail);

      // 特殊处理：如果错误信息中包含"template not found"（模板未找到）
      // 则重定向到配置的主页
      if (message && message.indexOf('template not found') > -1){
        ctx.status = 302;
        ctx.redirect(`${app.options?.homePage}`);
        return;
      }
      
      // 默认的错误响应结构
      const resBody = {
        success: false,
        code: 500,
        message:  '服务器异常',
      }

      // 设置响应状态码为200（即使出现错误也返回200，错误信息放在body中
      ctx.status = 200;
      // 设置响应体，返回统一格式的错误信息 
      ctx.body = resBody;

    }
  }
}