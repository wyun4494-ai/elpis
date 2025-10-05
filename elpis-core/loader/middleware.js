const path = require('path')
const glob = require('glob')
const { sep } = path

/**
 * middleware loader
 * @param {object} app Koa 实例
 * 
 * 加载所有 middleware 可通过 'app.middlewares.${目录}.${文件名}' 访问' 
 * 
 * 例如
 * app/middleware
 *    |
 *    | -- custom-module
 *               |
 *               | -- custom-middleware.js 
 * => app.middlewares.customModule.customMiddleware
 */ 

module.exports = (app) => {
  // 遍历所有文件目录，把内容加载到app.middlewares下
  const middlewares = {};
  
  // 拼接中间件文件所在elpis目录的完整路径 (如: D:\Elpis\app\middleware)
  const elpisMiddlewarePath = path.resolve(__dirname, `..${sep}..${sep}app${sep}middleware`);
  // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const elpisFileList = glob.sync(path.resolve(elpisMiddlewarePath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach(file => {
    handleFile(file);
  });
  // 拼接中间件文件所在业务目录的完整路径 (如: 业务根目录\app\middleware)
  const businessMiddlewarePath = path.resolve(app.businessPath, `.${sep}middleware`);
  const businessFileList = glob.sync(path.resolve(businessMiddlewarePath, `.${sep}**${sep}**.js`));
  businessFileList.forEach(file => {
    handleFile(file);
  });

  function handleFile(file) {
    // 提取文件名
    let name = path.resolve(file);

    // 截取路径 => app/middleware/custom-module/custom-middleware.js => custom-module/custom-middleware
    name = name.substring(name.lastIndexOf(`middleware${sep}`) + `middleware${sep}`.length, name.lastIndexOf('.'))

    // 把'-'统一成驼峰式,custom-module/custom-middleware => customModule/customMiddleware
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 middlewares 到内容 app 对象中

    // 创建临时引用指向中间件容器，用于构建嵌套结构
    let tempMiddleware = middlewares
    // 将中间件路径按分隔符分割成数组，例如 'user/auth' => ['user', 'auth']
    const names = name.split(sep);
    // 遍历路径数组，构建层次化的对象结构
    for (let i = 0; i < names.length; i++){
       // 判断是否为最后一层
      if (i === names.length - 1){
        // 创建中间件对象
        tempMiddleware[names[i]] = require(path.resolve(file))(app);
      }else{
        // 处理中间层目录结构
        // 如果当前层级的对象不存在，则创建空对象
        if (!tempMiddleware[names[i]]){
          tempMiddleware[names[i]] = {}
        }
        // 将临时引用指向下一层级，继续构建更深层的结构
        tempMiddleware = tempMiddleware[names[i]]
      }
    }
  }
  // 挂载 middlewares 到内容 app 对象中
  app.middlewares = middlewares;
} 