// 导出一个函数，接收 app（Koa 应用实例）和 router（路由实例）两个参数
module.exports = (app,router) => {
  // 从 app.controller 中获取 view 控制器实例，并重命名为 viewController
  // 这里的 view 对应 app/controller/view.js 文件
  const { view: viewController} = app.controller;

  // 定义一个 GET 路由，用于处理 GET 请求
  // viewController.renderPage.bind(viewController) 是路由处理函数
  // 使用 bind 确保 renderPage 方法内部的 this 指向正确的 viewController 实例
  router.get('/view/:page',viewController.renderPage.bind(viewController));
  router.get('/view/:page/*',viewController.renderPage.bind(viewController));
}