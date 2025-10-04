const webpack = require('webpack');
const webpackProdConfig = require('./config/webpack.prod.js')

module.exports = () => {
  console.log('\n 开始构建... \n')

 webpack(webpackProdConfig, (err, stats) => { 
    if (err) {
      console.error('Webpack构建错误:', err)
      return  
    }

    if (stats.hasErrors()) {
      console.error('构建过程中有错误:')
      console.error(stats.toJson().errors)
      return
    }

    if (stats.hasWarnings()) {
      console.warn('构建过程中有警告:')
      console.warn(stats.toJson().warnings)
    }

    console.log('构建成功!')
    process.stdout.write(`${stats.toString({
      colors: true, // 在控制台输出色彩信息
      modules: false, // 不显示模块信息
      children: false, // 不显示子模块信息
      chunks: false, // 不显示 chunk 信息
      chunkModules: true // 显示代码块中模块信息
    })}\n`)
 })
}