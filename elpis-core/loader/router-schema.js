const path = require('path')
const glob = require('glob')
const { sep } = path

/**
 * router-schema loader
 * @param {object} app koa 实例 
 * 
 * 通过 'json-schema' & 'ajv' 对 API 规则进行约束, 配合 api-params-verify 中间件使用
 * 
 * app/router-schema/**.js
 * 
 * 输出:
 * app.rouSchema = {
 *    '${api1}': ${jsonSchema},
 *    '${api2}': ${jsonSchema},
 *    '${api3}': ${jsonSchema},
 * }
 */
module.exports = (app) => {

  // 注册所有 router-schema, 使得可以 'app.routerSchema' 这样访问
  // 初始化空对象，用于存储所有路由规则
  let routerSchema = {}

  // 拼接路由规则文件所在elpis目录的完整路径
  const elpisRouterSchemaPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}router-schema`)
    // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const elpisFileList = glob.sync(path.resolve(elpisRouterSchemaPath, `.${sep}**${sep}*.js`))
  elpisFileList.forEach(file => {
    handleFile(file);
  });
  
  // 拼接路由规则文件所在业务目录的完整路径
  const businessRouterSchemaPath = path.resolve(app.businessPath, `.${sep}router-schema`)
  const businessFileList = glob.sync(path.resolve(businessRouterSchemaPath, `.${sep}**${sep}*.js`))
  businessFileList.forEach(file => {
    handleFile(file);
  });
  function handleFile(file) {
    // 将当前文件中的路由规则合并到 routerSchema 对象中
    routerSchema = {
      // 展开已有的路由规则（保持之前文件中已加载的规则）
      ...routerSchema,
      
      // 展开当前文件导出的路由规则（添加新规则）
      ...require(path.resolve(file))
    }
}
  app.routerSchema = routerSchema
}