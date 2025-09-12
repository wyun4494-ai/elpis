const  merge  = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')

// 基类配置
const baseConfig = require('./webpack.base.js')

// deserver 配置
const DEV_SERVER_CONFIG = {
  HOST: '127.0.0.1',
  PORT: 9002,
  HMR_PATH: '/__webpack_hmr', // 默认
  TIMEOUT: 20000
}

// 开发阶段的 entry 配置需要加入 hmr
Object.keys(baseConfig.entry).forEach(v => {
  // 第三方库不作为 hmr 入口
  if ( v !== 'vendor' ){
    baseConfig.entry[v] = [
      baseConfig.entry[v],
    `webpack-hot-middleware/client?path=http://${DEV_SERVER_CONFIG.HOST}:${DEV_SERVER_CONFIG.PORT}${DEV_SERVER_CONFIG.HMR_PATH}&timeout=${DEV_SERVER_CONFIG.TIMEOUT}&reload=true`
    ]
  }
})

// 生产环境 webpack 配置
const webpackDevConfig = merge(baseConfig, {
  // 指定开发环境配置
  mode: 'development',

  // 添加开发阶段插件，呈现代码的映射关系，便于在开发过程中调试代码
  devtool: 'eval-cheap-module-source-map',

  // 开发阶段 output 配置
  output: { 
    // 定义输出文件名格式：在 js 目录下生成 [入口名称]_[8位chunkhash].bundle.js
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    // 定义输出文件的绝对路径：
    path: path.join(process.cwd(), './app/public/dist/dev/'),
    // 外部资源公共路径
    publicPath: `http://${DEV_SERVER_CONFIG.HOST}:${DEV_SERVER_CONFIG.PORT}/public/dist/dev/`,
    //  
    globalObject: 'this'
  },
  plugins: [
    // 用于实现热模块替换
    // 热模块替换允许在运行时更新模块，而无需完全刷新页面
    new webpack.HotModuleReplacementPlugin({
      // 启用多步编译模式
      multiStep: true  
    })
  ]
})

module.exports = {
  // 配置开发环境 webpack 配置
  webpackDevConfig,
  // devServer 配置 ,暴露给 dev.js使用
  DEV_SERVER_CONFIG
}