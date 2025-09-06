const path = require('path');
// 模板渲染引擎
module.exports = (app) => {
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
}