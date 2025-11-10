const glob = require('glob')
const path = require('path');
const {sep} = path
const _ = require('lodash')

// project 继承 model 方法
const projectExtendModel = (model, project) => {
  return _.mergeWith({}, model, project, (modelValue, projectValue) => {
    // 如果modelValue和projectValue都是数组
    // 处理数组合并的特殊情况
    if (Array.isArray(modelValue) && Array.isArray(projectValue)){
      let result = []

      // 因为 project 继承 model，所以需要处理修改和新增内容的情况
      // project有的键值， model也有，则修改 （重载）
      // project有的键值， model中没有，则添加 (扩展)
      // model有的键值， project中没有，则保留 （继承）

      // 处理修改和保留
      for(let i = 0; i < modelValue.length; i++) {
        // 获取menu数据
        let modelItem = modelValue[i]; 
        // 获取和modelitem里的key值相同的projectitem
        const projectItem = projectValue.find(projectItem => projectItem.key === modelItem.key )

        // 如果匹配到相同的projectItem，则进行递归继承，没有则保留
        result.push(projectItem ? projectExtendModel(modelItem, projectItem) : modelItem)
      }

      // 处理新增
      for(let i = 0; i < projectValue.length; i++) {
        const projectItem = projectValue[i];
        const modelItem = modelValue.find(modelItem => modelItem.key === projectItem.key)
        if (!modelItem) {
          result.push(projectItem)
        }
      }
      return result
    }
    return undefined;
  })
}

/**
* 解析 model 配置， 并返回组织且继承后的数据结构
* [{
*   model: ${model};
*   project:{
*     proj1Key: ${proj1},
*     proj2Key: ${proj2}
*   }
* }, ...]
*
*/

 // 导出一个函数，接收app参数，用于构建model数据结构
module.exports = (_app) => {
  const modelList = [];

  // 遍历当前文件夹，构造模型数据结构，挂载到 modelList 上 
  const modelPath = path.resolve(process.cwd(), `.${sep}model`);
  const fileList = glob.sync(path.resolve(modelPath, `.${sep}**${sep}**.js`));
  fileList.forEach(file => {
    // 跳过当前文件(index.js)自身
    if (file.indexOf('index.js') > -1) {  return; }

    // 区分 model 文件和 project 文件
    const type = file.includes(`${sep}project${sep}`) || file.includes('/project/') || file.includes('\\project\\') ? 'project' : 'model';

     // 处理project类型的文件
    if (type === 'project') {
      // 从文件路径中提取model名称，例如从 model/business/project/pdd.js 提取 business
      const modelKey = file.match(/model[/\\]([^/\\]+)[/\\]project/)?.[1];
      // 从文件路径中提取project名称，例如从 model/business/project/pdd.js 提取 pdd
      const projectKey = file.match(/project[/\\]([^/\\]+)\.js/)?.[1];

      // 在modelList中查找是否已存在该modelKey对应的modelItem
      let modelItem = modelList.find(item => item.model?.key === modelKey)
      // 如果没有找到对应的modelItem，则创建一个新的对象并添加到modelList中
      if ( !modelItem ) {
        modelItem = {};
        modelList.push(modelItem);
      }
      // 如果modelItem还没有project属性，则初始化为空对象
      if ( !modelItem.project ) {
        modelItem.project = {};
      }
      // 加载project文件内容，并将其添加到modelItem.project对象中，以projectKey为键
      modelItem.project[projectKey] = require(path.resolve(file));
      // 为加载的project对象添加key属性，标识其名称
      modelItem.project[projectKey].key = projectKey
      modelItem.project[projectKey].modelKey = modelKey
    }

    // 处理model类型的文件
    if (type === 'model') {
      const modelKey = file.match(/[/\\]model[/\\](.*?)[/\\]model\.js/)?.[1]
      let modelItem = modelList.find(item => item.model?.key === modelKey)
      if ( !modelItem ) {
        modelItem = {};
        modelList.push(modelItem);
      }
      // 加载model文件内容，并将其赋值给modelItem.model
      modelItem.model = require(path.resolve(file));
      // 为加载的model对象添加key属性，标识其名称
      modelItem.model.key = modelKey
    }
  })

  // 数据进一步整理 project => 继承 model
  modelList.forEach(item => {
    const {model, project} = item;
    for (const projectKey in project){
      const originalModelKey = project[projectKey].modelKey;
      project[projectKey] = projectExtendModel(model, project[projectKey])
      // 确保 modelKey 在合并后被保留
      if (originalModelKey) {
        project[projectKey].modelKey = originalModelKey;
      }
    }
  })

  return modelList;
}