module.exports = (app) => { 
  return class projectController {
    /**
     * 获取项目列表
     * @param {object} ctx 上下文
     */
    async getList(ctx) {
      const  { project: projectService } = app.service
      const res = await projectService.getList()
      ctx.status = 200; // 设置HTTP响应状态码为200，表示请求成功
      // 设置响应体，返回统一格式的JSON数据
      ctx.body = {
        success: true,
        data: res,
        message: {}
      }
    }
  }
}