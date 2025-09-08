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
 *    '${api1}': ${jsonSschema},
 *    '${api2}': ${jsonSschema},
 *    '${api3}': ${jsonSschema},
 * }
 */
module.exports = (app) => {
  // 拼接中间件文件所在目录的完整路径
  const routerSchemaPath = path.resolve(app.businessPath, `.${sep}router-schema`)
    // 使用glob模式匹配查找所有嵌套目录下的.js文件 (**表示任意层级子目录)
  const fileList = glob.sync(path.resolve(routerSchemaPath, `.${sep}**${sep}*.js`))

  // 注册所有 router-schema, 使得可以 'app.routerSchema' 这样访问
  // 初始化空对象，用于存储所有路由规则
  let routerSchema = {}

  // 遍历所有找到的路由规则文件
  fileList.forEach(file => {
    // 将当前文件中的路由规则合并到 routerSchema 对象中
    routerSchema = {
      // 展开已有的路由规则（保持之前文件中已加载的规则）
      ...routerSchema,
      
      // 展开当前文件导出的路由规则（添加新规则）
      ...require(path.resolve(file))
    }
})

  app.routerSchema = routerSchema
}