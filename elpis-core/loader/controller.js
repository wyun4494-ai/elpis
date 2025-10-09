const path = require('path')
const glob = require('glob')
const { sep } = path

/**
 * controller loader
 * @param {object} app Koa 实例
 *
 * 加载所有 controller 可通过 'app.controller.${目录}.${文件名}' 访问'
 *
 * 例如
 * app/controller
 *    |
 *    | -- custom-module
 *               |
 *               | -- custom-controller.js
 * => app.controller.customModule.customController
 */

module.exports = (app) => {

  // 遍历所有文件目录，把内容加载到app.controller 下
  const controller = {};

  // 拼接控制器文件所在elpis目录的完整路径 (如: D:\Elpis\app\controller)
  const elpisControllerPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}controller`);
  // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const elpisFileList = glob.sync(path.resolve(elpisControllerPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(file => {
    handleFile(file);
  });

  // 拼接控制器文件所在业务目录的完整路径 (如: 业务根目录\app\controller)
  const businessControllerPath = path.resolve(app.businessPath, `.${sep}controller`);
  const businessFileList = glob.sync(path.resolve(businessControllerPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(file => {
    handleFile(file);
  });

  function handleFile(file) {
    // 提取文件名
    let name = path.resolve(file);

    // 截取路径 => app/controller/custom-module/custom-controller.js => custom-module/custom-controller
    name = name.substring(name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length, name.lastIndexOf('.'))

    // 把'-'统一成驼峰式,custom-module/custom-controller => customModule/customController
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 controller 到内容 app 对象中

    // 创建临时引用指向控制器容器，用于构建嵌套结构
    let tempController = controller
    // 将控制器路径按分隔符分割成数组，例如 'user/auth' => ['user'(目录), 'auth'(文件)]
    const names = name.split(sep);
    // 遍历路径数组，构建层次化的对象结构
    for (let i = 0; i < names.length; i++){
       // 判断是否为最后一层
      if (i === names.length - 1){
        // 创建控制器实例对象
        // 1. 加载控制器模块并传入app实例，获取返回的控制器类
        const ControllerModule = require(path.resolve(file))(app);
        // 2. 实例化控制器类，创建具体的控制器对象实例
        tempController[names[i]] = new ControllerModule();
      }else{
        // 处理控制器目录结构
        // 如果当前层级的对象不存在，则创建空对象
        if (!tempController[names[i]]){
          tempController[names[i]] = {}
        }
        // 将临时引用指向下一层级，继续构建更深层的结构
        tempController = tempController[names[i]]
      }
    }
  }
  // 挂载 middlewares 到内容 app 对象中
  app.controller = controller;
}