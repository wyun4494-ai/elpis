module.exports = (app) => { 
  // 引入基础控制器类，用于继承基础方法如success、error等
  const BaseController = require('./base')(app);
  
  // 导出并创建项目控制器类，继承基础控制器
  return class projectController extends BaseController {
    /**
     * 获取所有模型与项目的结构化数据
     * @param {object} ctx 上下文对象，包含请求和响应相关信息
     */
    async getModelList(ctx) {
      // 从app.service中解构出project服务模块
      const  { project: projectService } = app.service
      const modelList = await projectService.getModelList();

      // 构造返回结果，只返回关键数据
      const dtoModelList = modelList.reduce((preList, item) => {
        const  { model, project } = item
        
        // 构造 model 关键数据
        const {key, name, desc} = model
        const dtoModel = {key, name, desc}

        // 构造 project 关键数据
        const dtoProject = Object.keys(project).reduce((pre, projKey) => {
          const {key, name, desc, homePage} = project[projKey]
          pre[projKey] = {key, name, desc, homePage}
          return pre
        }, {})

        preList.push({
          model: dtoModel,
          project: dtoProject
        })

        return preList
      }, [])

      // 调用基础控制器的success方法，返回成功响应和项目列表数据
      this.success(ctx,dtoModelList) 
    }
  }
}