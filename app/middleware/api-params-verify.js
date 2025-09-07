const Ajv = require('ajv')
const ajv = new Ajv()

/**
 * API参数验证中间件
 * 用于验证API请求的参数是否符合预定义的JSON Schema规范
 */

module.exports = (app) => {

  // JSON Schema标准版本定义
  const $schema = "http://json-schema.org/draft-07/schema#"

  // 返回中间件函数，处理每个请求
  return async (ctx, next) => { 
    // 只对API请求进行参数验证，非API请求直接跳过
    if (ctx.path.indexOf('/api') < 0 ) {
      return await next()
    }

    // 获取请求的各个部分参数
    const {body, query, headers} = ctx.request;  // 请求体、查询参数、请求头
    const {params, path, method} = ctx;         // 路径参数、请求路径、请求方法

    // 记录请求信息到日志，便于调试和监控
    app.logger.info(`[${method} ${path}] body: ${JSON.stringify(body)}]`)
    app.logger.info(`[${method} ${path}] query: ${JSON.stringify(query)}]`)
    app.logger.info(`[${method} ${path}] params: ${JSON.stringify(params)}]`)
    app.logger.info(`[${method} ${path}] headers: ${JSON.stringify(headers)}]`)

    // 从应用的路由Schema配置中获取当前路径和方法对应的参数验证规则
    const schema = app.routerSchema[path]?.[method.toLowerCase()]

    // 如果没有定义验证规则，则跳过验证
    if (!schema) {
      return await next();
    }

    // 验证结果标志，默认为true
    let valid = true

    // 用于存储ajv验证器实例
    let validata;

    // 按优先级顺序验证各部分参数: headers -> body -> query -> params

    // 验证请求头(headers)参数
    if (valid && headers && schema.headers) {
      schema.headers.$schema = $schema           // 设置JSON Schema版本
      validata = ajv.compile(schema.headers)     // 编译验证器
      valid = validata(headers)                  // 执行验证
    }

    // 验证请求体(body)参数
    if (valid && body && schema.body) {
      schema.body.$schema = $schema             
      validata = ajv.compile(schema.body)       
      valid = validata(body)                    
    }

    // 验证查询参数(query)参数
    if (valid && query && schema.query) {
      schema.query.$schema = $schema            
      validata = ajv.compile(schema.query)      
      valid = validata(query)                   
    }

    // 验证路径参数(params)参数
    if (valid && params && schema.params) {
      schema.params.$schema = $schema           
      validata = ajv.compile(schema.params)     
      valid = validata(params)                  
    }

    // 如果验证失败，返回错误响应
    if (!valid){
      ctx.status = 200;                          // HTTP状态码设为200
      ctx.body = {                               // 返回错误信息
        success: false,                          // 标记请求处理失败
        message: `request validate fail ${ajv.errorsText(validata.errors)} `, // 错误详情
        code: 442                                // 自定义错误码
      }
      return                                     // 中断后续处理流程
    }

    // 验证通过，继续执行后续中间件
    await next()
  }
}