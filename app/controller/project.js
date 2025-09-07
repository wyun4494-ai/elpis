module.exports = (app) => { 
  // 引入基础控制器类，用于继承基础方法如success、error等
  const BaseController = require('./base')(app);
  // 导出并创建项目控制器类，继承基础控制器
  return class projectController extends BaseController {
    /**
     * 获取项目列表
     * @param {object} ctx 上下文对象，包含请求和响应相关信息
     */
    async getList(ctx) {
      // 从请求查询参数中解构出proj_key，并重命名为projKey变量
      const { proj_key: projKey } = ctx.request.query
      // 在控制台打印projKey值，用于调试
      console.log(projKey)
      // 从app.service中解构出project服务模块
      const  { project: projectService } = app.service
      // 调用project服务的getList方法获取项目列表数据
      const projectList = await projectService.getList();
      // 调用基础控制器的success方法，返回成功响应和项目列表数据
      this.success(ctx,projectList) 
    }
  }
}