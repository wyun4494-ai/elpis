  const path = require("path")
  const glob = require("glob")
  const {sep} = path
/**
 * extend loader
 * @param {object} app Koa 实例
 * 
 * 加载所有 extend, 可通过 'app.extend.${文件}访问'
 * 
 * 例子:
 * app/extend
 *    |
 *    | -- custom-extend.js
 * => app.extend.customExtend 访问
 */
module.exports = (app) => {
   // 拼接extend目录的完整路径 (如: D:\Elpis\app\extend)
  const elpisExtendPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}extend`)
  // 使用glob模式匹配查找extend目录下的所有.js文件
  const elpisFileList = glob.sync(path.resolve(elpisExtendPath, `.${sep}**${sep}**.js`))
  elpisFileList.forEach(file => {
    handleFile(file);
  });

  // 拼接extend目录的完整路径 (如: D:\Elpis\app\extend)
  const businessExtendPath = path.resolve(app.businessPath, `.${sep}extend`)
  // 使用glob模式匹配查找extend目录下的所有.js文件
  const businessFileList = glob.sync(path.resolve(businessExtendPath, `.${sep}**${sep}**.js`))
  businessFileList.forEach(file => {
    handleFile(file);
  });

  function handleFile(file) {
    //  提取文件的完整路径
    let name = path.resolve(file)

    // 截取路径 => app/extend/custom-extend.js => custom-extend
    name = name.substring(name.indexOf(`extend${sep}`) + `extend${sep}`.length, name.indexOf('.'))

    // 把'-'换成驼峰式,custom-extend => customExtend
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase())

    // 检查app中是否已存在同名属性，避免覆盖
    for(const key in app){
      if(key === name){
        console.log(`[extend load error] name: ${name} is already  in app `)
        return;
      }
    } 
    // 加载扩展模块并传入app实例，将返回结果挂载到app上
    // 例如: app.customExtend = require('custom-extend.js')(app)
    app[name] = require(path.resolve(file))(app)

  }
}