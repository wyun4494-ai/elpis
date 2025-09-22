/**
 * projectHandler 相关项目处理内容
 */

module.exports = (app) => {
  return async (ctx, next) => {

    if (ctx.path.indexOf('/api/proj') < 0) {
      return await next()
    }

    const { proj_key : projKey} = ctx.request.headers

    if (!projKey) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        message: 'no project key',
        code: 446
      };
      return;
    }
    ctx.projKey = projKey

    await next()
  }
}