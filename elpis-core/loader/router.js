const KoaRouter = require("koa-router")
const path = require("path")
const glob = require("glob")
const {sep} = path

/**
 * router loader
 * @param {object} app Koa 实例
 *  
 * 解析所有 app/router/ 路径下的所有js文件 加载到 KoaRouter 下
 */
module.exports = (app) => {
  
  //获取所有路由文件
  const routerPath = path.resolve(app.businessPath, `.${sep}router`)
  
  // 创建路由实例
  const router = new KoaRouter()
  
  // 注册所有路由
  const fileList = glob.sync(path.resolve(routerPath, `.${sep}**${sep}*.js`))
  fileList.forEach(file => {
    // 加载路由模块，并传入app实例和router实例
    require(path.resolve(file))(app,router)
  })

  // 根路径重定向到首页
  router.get('/', async (ctx,next) => {
    ctx.status = 302;
    ctx.redirect(app?.options?.homePage ?? '/view/project-list');
  });

  // 路由兜底 - 放在最后确保其他路由优先匹配
  router.get('/view/*', async (ctx,next) => {
    ctx.status = 302;
    ctx.redirect(`${app?.options?.homePage ?? './'}`);
  });

  // 将路由实例保存到app对象上，方便调试
  app.router = router
  
  // 注册路由实例
  app.use(router.routes())
  app.use(router.allowedMethods())
}