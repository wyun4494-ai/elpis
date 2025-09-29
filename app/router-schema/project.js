// API路由模式定义文件\

// 用于定义和验证API接口的请求规范
module.exports = {
  '/api/project': {
      // 获取项目配置接口
      get: {
        query: {
          type: 'object',
          properties: {
            proj_key: {
              type: 'string',
            }
          },
          required: ['proj_key'], 
        }
      }
    }, 

  '/api/project/list': {
    // 获取项目列表接口
    get: {
      query: {
        type: 'object',
        properties: {
          proj_key: {
            type: 'string',
          }
        }
      }
    }
  },

  // 获取项目列表关键数据接口
  '/api/project/model_list': {
    get: {
      // 这个接口不需要任何参数
    }
  }
}