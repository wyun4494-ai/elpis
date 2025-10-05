const path = require('path')
const glob = require('glob')
const { sep } = path

/**
 * service loader
 * @param {object} app Koa 实例
 * 
 * 加载所有 service 可通过 'app.service.${目录}.${文件名}' 访问' 
 * 
 * 例如
 * app/service
 *    |
 *    | -- custom-module
 *               |
 *               | -- custom-service.js 
 * => app.service.customModule.customService
 */ 

module.exports = (app) => {

  // 遍历所有文件目录，把内容加载到app.service 下
  const service = {}; 

  // 拼接服务层文件所在elpis目录的完整路径 (如: D:\Elpis\app\service)
  const elpisServicePath = path.resolve(__dirname, `..${sep}..${sep}app${sep}service`);
  // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const elpisFileList = glob.sync(path.resolve(elpisServicePath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(file => {
    handleFile(file);
  });
  // 拼接服务层文件所在业务目录的完整路径 (如: 业务根目录\app\service)
  const businessServicePath = path.resolve(app.businessPath, `.${sep}service`);
  // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const businessFileList = glob.sync(path.resolve(businessServicePath, `.${sep}**${sep}**.js`));  
  businessFileList.forEach(file => {
    handleFile(file); 
  });

  function handleFile(file) {
    // 提取文件名
    let name = path.resolve(file);

    // 截取路径 => app/service/custom-module/custom-service.js => custom-module/custom-service
    name = name.substring(name.lastIndexOf(`service${sep}`) + `service${sep}`.length, name.lastIndexOf('.'))

    // 把'-'统一成驼峰式,custom-module/custom-service => customModule/customService
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 service 到内容 app 对象中

    // 创建临时引用指向服务层容器，用于构建嵌套结构
    let tempService = service
    // 将服务层路径按分隔符分割成数组，例如 'user/auth' => ['user'(目录), 'auth'(文件)]
    const names = name.split(sep);
    // 遍历路径数组，构建层次化的对象结构
    for (let i = 0; i < names.length; i++){
       // 判断是否为最后一层
      if (i === names.length - 1){
        // 创建服务层实例对象
        // 1. 加载服务层模块并传入app实例，获取返回的服务层类
        const serviceModule = require(path.resolve(file))(app);
        // 2. 实例化服务层类，创建具体的服务层对象实例
        tempService[names[i]] = new serviceModule();     
      }else{
        // 处理服务层目录结构
        // 如果当前层级的对象不存在，则创建空对象
        if (!tempService[names[i]]){
          tempService[names[i]] = {}
        }
        // 将临时引用指向下一层级，继续构建更深层的结构
        tempService = tempService[names[i]]
      }
    }
  } 

  // 挂载 service 到内容 app 对象中
  app.service = service;
} 