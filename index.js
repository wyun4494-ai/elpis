// 引入elpis-core
const ElpisCore = require('./elpis-core')
// 引入前端工程化构建方法
const FEBuildDev = require('./app/webpack/dev')
const FEBuildProd = require('./app/webpack/prod')


module.exports = {
  /**
   * 服务端基础
   */
  Controller: {
    Base: require('./app/controller/base')
  },
  Service: {
    Base: require('./app/service/base')
  },

  /**
   * 编译构建前端工程
   * @param env 环境变量 dev/prod
   */
  frontendBuild(env) {
    if(env === 'local') {
      FEBuildDev()
    } else if(env === 'production') {
      FEBuildProd()
    }
  },

  /**
   * 启动项目
   * @param {object} options 项目配置 透传到 elpis-core
   * @returns {object} app 项目实例
   */
  serverStart(options = {}) {
    const app = ElpisCore.start(options)
    return app
  }

}
