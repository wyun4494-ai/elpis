module.exports = (app) => {
  const BaseService = require('./base')(app);
  const modelList = require('../../model/index')(app);
  // console.log(JSON.stringify(modelList));
  return class projectService extends BaseService {
    /**
     * 获取项目配置
     * @param {string} projectKey 项目键值，用于指定要获取的项目配置
     */
    async get(projectKey) {
      let projConfig;


    const foundModel = modelList.find(modelItem => {
      const { project } = modelItem;
      return project[projectKey];
    });
    if (foundModel) {
      const { project } = foundModel;
      projConfig = project[projectKey];
      if (projConfig) {
          projConfig.proj_key = projectKey;
        }
    }

      return projConfig;
    }

    /**
     * 获取统一模型下的项目列表，如果无 projectKey，则获取所有项目列表
     * @param {string} proj_key 项目key
     */
    async getProjectList({ projectKey }) {
     return  modelList.reduce((preList, modelItem) => {
        const { project, model } = modelItem;
        const modelKey = model?.key;

        // 如果有传 projectKey，但项目里面没有这个 projectKey，则返回
        if (projectKey && !project[projectKey]) return preList;

        for(const projKey in project) {
          const projConfig = project[projKey];
          // 确保 modelKey 被正确设置
          if (modelKey && !projConfig.modelKey) {
            projConfig.modelKey = modelKey;
          }
          preList.push(projConfig);
        }
        return preList;
      }, [])
    }


    /**
     * 获取所有模型与项目的结构化数据
     */
    async getModelList() {
      return modelList;
    }
  }
}