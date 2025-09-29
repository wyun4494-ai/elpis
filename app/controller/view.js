// 这个函数返回一个控制器类
module.exports = (app) => { 
   // 返回一个名为 viewController 的类
    return class viewController {
    /**
     * 渲染页面
     * @param {object} ctx 上下文
     */
    async renderPage(ctx) {
      app.logger.info(`[viewController] query: ${JSON.stringify(ctx.query)} `)
      app.logger.info(`[viewController] params: ${JSON.stringify(ctx.params)} `)
      // ctx.render() 是模板引擎提供的方法，用于渲染模板
      // ctx.params.page 获取路由中的 :page 参数值
      // 例如：如果访问 /view/page1，那么 ctx.params.page 就是 "page1"
      // 最终会渲染 output/entry.page1 模板
      await ctx.render(`dist/entry.${ctx.params.page}`,{
        projKey: ctx.query?.proj_key,
        name: app.options?.name,
        env: app.env.get(),
        options: JSON.stringify(app.options)
      })
    }
  }
}
