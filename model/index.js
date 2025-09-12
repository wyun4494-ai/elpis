 const glob = require('glob')
 const path = require('path')
 const {sep} = path

 /** 
  * 解析 model 配置， 并返回组织且继承后的数据结构  
  * [{
  *   model: ${model};
  *   project:{
  *     proj1: ${proj1},
  *     proj2: ${proj2}   
  *   }
  * }, ...]
  * 
 */

 module.exports = (app) => { 
  const modelList = [];

  // 遍历当前文件夹，构造模型数据结构，挂载到 modelList 上 
  const modelPath = path.resolve(app.baseDir, `.${sep}model`);
  const fileList = glob.sync(path.resolve(modelPath, `.${sep}**${sep}**.js`));
  fileList.forEach(file => {
    if (file.indexOf('index.js') > -1) {  return; }

    // 区分 model 文件和 project 文件
    // const type = file.indexOf(`${sep}project${sep}`) > -1 ? 'project' : 'model';
    
  })

  return modelList;
 }