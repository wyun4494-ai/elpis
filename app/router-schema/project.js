// API路由模式定义文件
// 用于定义和验证API接口的请求规范
module.exports = {
  // 定义API路径：获取项目列表接口
  '/api/project/list': {
    // 定义GET请求的处理规则
    get: {
      // 定义查询参数（URL中?后面的部分）的验证规则
      query: {
        // 指定查询参数应该是一个对象类型
        type: 'object',
        // 定义对象的属性规范
        properties: {
          // 定义proj_key属性
          proj_key: {
            // 指定proj_key必须是字符串类型
            type: 'string'
          }
        },
        // 指定必需的参数列表，proj_key是必须提供的参数
        required: ['proj_key']
      }
    }
  }
}