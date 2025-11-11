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
    if (ctx.path.indexOf('/api/') < 0 ) {
      return await next()
    }

    // 获取请求的各个部分参数
    const {body, query, headers} = ctx.request;  // 请求体、查询参数、请求头
    const {params, path, method} = ctx;         // 路径参数、请求路径、请求方法

    // 从应用的路由Schema配置中获取当前路径和方法对应的参数验证规则
    const schema = app.routerSchema[path]?.[method.toLowerCase()]

    // 如果没有定义验证规则，则跳过验证
    if (!schema) {
      return await next();
    }

    // 验证结果标志，默认为true
    let valid = true

    // 用于存储ajv验证器实例
    let validate;

    // 按优先级顺序验证各部分参数: headers -> body -> query -> params

    // 验证请求头(headers)参数
    if (valid && headers && schema.headers) {
      schema.headers.$schema = $schema           // 设置JSON Schema版本
      validate = ajv.compile(schema.headers)     // 编译验证器
      valid = validate(headers)                  // 执行验证
    }

    // 验证请求体(body)参数
    if (valid && body && schema.body) {
      schema.body.$schema = $schema
      validate = ajv.compile(schema.body)
      valid = validate(body)
    }

    // 验证查询参数(query)参数
    if (valid && query && schema.query) {
      schema.query.$schema = $schema
      validate = ajv.compile(schema.query)
      valid = validate(query)
    }

    // 验证路径参数(params)参数
    if (valid && params && schema.params) {
      schema.params.$schema = $schema
      validate = ajv.compile(schema.params)
      valid = validate(params)
    }

    // 如果验证失败，返回错误响应
    if (!valid){
      ctx.status = 200;                          // HTTP状态码设为200

      // 将英文错误消息转换为中文
      let errorMessage = '参数验证失败'
      if (validate.errors && validate.errors.length > 0) {
        const error = validate.errors[0]
        const { keyword, dataPath, params } = error

        // 根据验证错误类型生成中文错误消息
        if (keyword === 'minLength') {
          errorMessage = `${dataPath || '字段'}长度不能少于 ${params.limit} 个字符`
        } else if (keyword === 'maxLength') {
          errorMessage = `${dataPath || '字段'}长度不能超过 ${params.limit} 个字符`
        } else if (keyword === 'minimum') {
          errorMessage = `${dataPath || '字段'}不能小于 ${params.limit}`
        } else if (keyword === 'maximum') {
          errorMessage = `${dataPath || '字段'}不能大于 ${params.limit}`
        } else if (keyword === 'type') {
          errorMessage = `${dataPath || '字段'}类型错误，应为 ${params.type}`
        } else if (keyword === 'required') {
          errorMessage = `${dataPath || '字段'}为必填项`
        } else if (keyword === 'enum') {
          errorMessage = `${dataPath || '字段'}值不在允许的范围内`
        } else if (keyword === 'pattern') {
          errorMessage = `${dataPath || '字段'}格式不正确`
        } else {
          errorMessage = `参数验证失败: ${ajv.errorsText(validate.errors)}`
        }
      }

      ctx.body = {                               // 返回错误信息
        success: false,                          // 标记请求处理失败
        message: errorMessage,                   // 中文错误详情
        code: 442                                // 自定义错误码
      }
      return                                     // 中断后续处理流程
    }

    // 验证通过，继续执行后续中间件
    await next()
  }
}