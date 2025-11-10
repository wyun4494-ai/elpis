/**
 * projectHandler 相关项目处理内容
 *
 * 白名单说明：
 * - 登录和注册接口不需要 project key（用户未登录时无法获取 projKey）
 * - 其他 /api/proj/ 接口必须携带 project key
 */

module.exports = (app) => {
  // 白名单：不需要 project key 的接口
  const whiteList = [
    '/api/proj/auth/login',
    '/api/proj/auth/register',
    '/api/proj/auth/logout',
    '/api/proj/auth/user-info',
    '/api/proj/user/menu',  // 获取用户菜单权限列表
    '/api/proj/user/project-list',  // 获取用户有权限访问的项目列表
    '/api/proj/user/check-project-permission'  // 检查用户是否有权限访问项目
  ]

  return async (ctx, next) => {

    if (ctx.path.indexOf('/api/proj/') < 0) {
      return await next()
    }

    // 白名单接口直接放行
    if (whiteList.includes(ctx.path)) {
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