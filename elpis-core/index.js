// 引入koa框架
const Koa = require('koa');
// 引入路径处理模块
const path = require('path');
const { sep } = path; // 处理不同操作系统的斜杠

// 引入环境配置
const env = require('./env');

// 引入加载器
const configLoader = require('./loader/config');
const extendLoader = require('./loader/extend'); 
const middlewareLoader = require('./loader/middleware');
const routerSchemaLoader = require('./loader/router-schema');
const serviceLoader = require('./loader/service');
const controllerLoader = require('./loader/controller');
const routerLoader = require('./loader/router');

module.exports = {
  /**
   * 启动项目
   * @params options 项目配置
   * options{
   *    name // 项目名称
   *    homePath // 项目首页
   * }
   */
  start (options = {}) {
    // 创建koa实例
    const app = new Koa();
;
    // 应用配置
    app.options = options;
    
    // 设置基础路径为当前工作目录 = 根目录 
    app.baseDir = process.cwd();
    
    // 业务文件路径的绝对路径 = 根目录 + app目录 的绝对路径
    app.businessPath = path.resolve(app.baseDir,`.${sep}app`);

    // 初始化环境配置
    app.env = env();
    console.log(`-- [start] env: ${app.env.get()} --`);

    // 加载配置
    configLoader(app);
    console.log(`-- [start] config done --`);

    // 加载扩展
    extendLoader(app);
    console.log(`-- [start] extend done --`);
    
    // 加载中间件
    middlewareLoader(app);
    console.log(`-- [start] middleware done --`);
    
    // 加载路由配置
    routerSchemaLoader(app);
    console.log(`-- [start] routerSchema done --`);

    // 加载服务 
    serviceLoader(app);
    console.log(`-- [start] service done --`);

    // 加载控制器
    controllerLoader(app);
    console.log(`-- [start] controller done --`);

    // 注册 elpis 中间件
    try {
      const elpisMiddlewarePath = path.resolve(__dirname, `..${sep}app${sep}middleware`);
      const elpisMiddleware =require(elpisMiddlewarePath)
      elpisMiddleware(app);
      console.log(`-- [start] load elpis middleware done --`);
    } catch (e) {
      console.log(`-- [exception] load elpis middleware error: ${e.message} --`);
    }


    // 注册业务中间件
    try {
      require(`${app.businessPath}${sep}middleware.js`)(app);
      console.log(`-- [start] load business middleware done --`);
    } catch (e) {
      console.log(`-- [exception] there is no business middleware file ${e.message} --`);  
    }

    // 加载路由
    routerLoader(app);
    console.log(`-- [start] router done --`);

    
    // 启动服务
    try {
      const port = process.env.PORT || 8083;
      const host = process.env.HOST || '0.0.0.0';
      app.listen(port, host);
      console.log(`Server running on port:${port}`);
    } catch(e) {
      console.error(e);
    }

    return app;
  }
}