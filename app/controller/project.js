module.exports = (app) => { 
  // 引入基础控制器类，用于继承基础方法如success、error等
  const BaseController = require('./base')(app);
  
  // 导出并创建项目控制器类，继承基础控制器
  return class projectController extends BaseController {

    /**
     * 获取项目配置
     * @param {object} ctx 上下文对象，包含请求和响应相关信息
     * @param {string} ctx.request.query.proj_key 项目键值，用于指定要获取的项目配置
     */
    async get(ctx) {
      const { 
        proj_key: projKey
      } = ctx.request.query;

      const { project: projectService} = app.service;
      const projConfig = await projectService.get(projKey);

      if(!projConfig) {
        this.fail(ctx, '项目获取异常', 5000);
        return;
      }

      // 调用基础控制器的success方法，返回成功响应和项目配置数据
      this.success(ctx,projConfig) 
    }


    /**
     * 获取项目列表
     * 获取当前 projectKey 对应模型下的项目列表 （如果无 projectKey， 则获取所有项目列表）
     */
    async getProjectList(ctx) {
      const { 
        proj_key: projectKey
      } = ctx.request.query;

      // 从app.service中解构出project服务模块
      const  { project: projectService } = app.service
      const projectList = await projectService.getProjectList({projectKey});

      // 构造返回结果，只返回关键数据
      const dtoProjectList = projectList.map(item => {
        const { name, desc, homePage, key, modelKey} = item;
        return {
          name,
          desc,
          homePage,
          key,
          modelKey
        }
      })

      // 调用基础控制器的success方法，返回成功响应和项目列表数据
      this.success(ctx,dtoProjectList) 
    }



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
          const {key, name, desc, homePage, modelKey} = project[projKey]
          pre[projKey] = {key, name, desc, homePage, modelKey}
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