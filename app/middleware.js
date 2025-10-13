  const path = require('path');
  // 模板渲染引擎中间件
  module.exports = (app) => {
    // 引入koa-static中间件，用于提供静态文件服务
    const KoaStatic = require('koa-static');
    // 将app/public目录设置为静态文件服务目录
    // 这样可以直接通过URL访问该目录下的文件，如CSS、JS、图片等
    // path.resolve(process.cwd(), './app/public')将相对路径解析为绝对路径
    app.use(KoaStatic(path.resolve(__dirname, './public'))) 
    app.use(KoaStatic(path.resolve(process.cwd(), './app/public')))

    // 引入koa-nunjucks-2中间件
    const koaNunjucks = require('koa-nunjucks-2');
    app.use(koaNunjucks({
    ext: 'tpl', // 配置模板文件的扩展名
    path: path.resolve(process.cwd(), './app/public'),  // 配置模板文件的查找路径
    nunjucksConfig: {
      nocache: true, // 开发时禁用缓存
      trimBlocks: true // trimBlocks设置为true，表示自动去除块级标签后的空白字符
    }
  }));

  // 引入koa-bodyParser中间件，用于解析HTTP请求体
    const bodyParser = require('koa-bodyparser');
    app.use(bodyParser({
      formLimit: '1000mb', // 设置表单数据大小限制为1000MB
      enableTypes:['json', 'form', 'text'] // 启用解析的请求体类型：JSON、表单、文本  
    }));

  // 引入 自定义的错误处理中间件
  app.use(app.middlewares.errorHandler)

  // 引入 签名合法校验
  app.use(app.middlewares.apiSignVerify)

  // 引入 API参数校验
  app.use(app.middlewares.apiParamsVerify)

  // 引入 项目处理中间件
  app.use(app.middlewares.projectHandler)
} 