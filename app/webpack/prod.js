const webpack = require('webpack');
const webpackProdConfig = require('./config/webpack.prod.js')

console.log('\n 开始构建... \n')

 webpack(webpackProdConfig, (err, stats) => { 
    if (err) {
      console.log(err)
      return  
    }

    process.stdout.write(`${stats.toString({
      colors: true, // 在控制台输出色彩信息
      modules: false, // 不显示模块信息
      children: false, // 不显示子模块信息
      chunks: false, // 不显示 chunk 信息
      chunkModules: true // 显示代码块中模块信息
    })}\n`)
 })