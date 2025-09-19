module.exports = (app,router) => {
  const { project: projectController} = app.controller;
  
  // 获取项目配置接口
  router.get('/api/project',projectController.get.bind(projectController))
  // 获取项目列表接口
  router.get('/api/project/list',projectController.getProjectList.bind(projectController))
  // 获取项目列表关键数据接口
  router.get('/api/project/model_list',projectController.getModelList.bind(projectController))
}