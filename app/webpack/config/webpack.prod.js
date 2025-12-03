const merge = require('webpack-merge')
const path = require('path')
const os = require('os')
const HappyPack = require('happypack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin')    
const TerserWebpackPlugin = require('terser-webpack-plugin')

// 优先从当前工作目录的 node_modules 查找（支持从业务项目查找）
// 如果业务项目安装了依赖，会从业务项目的 node_modules 查找
// const elpisNodeModulesPath = path.resolve(process.cwd(), './node_modules');

// 多线程 build 配置
const happypackCommonConfig = {
    // 是否开启调试模式，设为false表示不输出调试信息
  debug: false,
  // 创建一个线程池，大小为CPU核心数，用于并行处理任务
  threadPool: HappyPack.ThreadPool({ size: os.cpus().length }),
}


// 基类配置
const baseConfig = require('./webpack.base.js')

// 生产环境配置
const webpackProdConfig = merge.smart(baseConfig, {
  mode: 'production',

  output: {
    // 定义输出文件名格式：在 js 目录下生成 [入口名称]_[8位chunkhash].bundle.js
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    // 定义输出文件的绝对路径：当前工作目录下的 ./app/public/dist/prod
    path: path.join(process.cwd(), './app/public/dist/prod/'),
    // 指定浏览器访问资源的公共路径前缀
    publicPath: '/dist/prod/',
    // 设置跨域加载脚本时的 credentials 标志为 anonymous（不发送 cookies 等）
    crossOriginLoading: 'anonymous'
  },

  module: {
    rules: [{
      test: /\.css$/,
      use: [
        // 1. 提取 loader（负责提取 CSS）
        MiniCssExtractPlugin.loader,
        // 2. CSS loader（负责解析 CSS）
        // 注意：不使用 HappyPack 处理 CSS，因为 css-loader v7+ 与 HappyPack 不兼容
        // Webpack 5 已内置并行处理，无需 HappyPack
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1
          }
        }
      ]
    }, {
      test: /\.js$/,
      include: [
        // 只对指定的elpis路径下的 .js 文件进行 babel 转换
        path.resolve(__dirname, '../../pages'),
        // 只对指定的业务路径下的 .js 文件进行 babel 转换
        path.resolve(process.cwd(), './app/pages')
      ],
      use: [
        `happypack/loader?id=js`,
      ]
    }]
  },
  // webpack 不会有大量 hits 信息， 默认为 warning
  performance: {
    hints: false
  },

  plugins: [
    // 每次build前 ， 清空 public/dist 目录
    new CleanWebpackPlugin(['public/dist'], {
      // 设置清理操作的根目录为 ./app 目录
      root: path.resolve(process.cwd(),'./app'),
      // 指定不需要删除的文件或目录（排除 static 目录）
      exclude: ['public/static'],
      // 启用详细日志输出，显示删除过程
      verbose: true,
      // 设置为 false 表示执行实际删除操作（true 为模拟删除）
      dry: false
    }),

    // 提取 css 公共部分，有效利用缓存 （非公共部分使用 inline ）
    new MiniCssExtractPlugin({
      // 异步加载的CSS文件
      chunkFilename: 'css/[name].[contenthash:8].bundle.css',
    }),

    // 优化并压缩css资源 - 暂时禁用
    // new CssMinimizerPlugin(),
    
    // 多线程打包 js ，加快打包速度 
    new HappyPack({
     // 展开通用配置，包含调试设置和线程池配置
      ...happypackCommonConfig,

      // 指定loader的ID，用于在rules中引用
      id: 'js',

      // 配置需要使用的loader
      // 使用字符串名称而不是绝对路径，让 webpack 自动解析
      loaders: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }]
    }),

    // 浏览器在请求资源时，不会发送用户的身份凭证
    new HtmlWebpackInjectAttributesPlugin({
      // 确保加载外部资源时不携带身份凭证
      crossorigin: 'anonymous'
    })
  ],
  
  optimization: {
    // 使用 TerserPlugin 的并发和缓存，提升压缩阶段的性能 

    // 启用代码压缩功能
    minimize: true,

    // 定义用于执行代码压缩的插件
    minimizer: [
      new TerserWebpackPlugin({
        parallel: true, // 利用多核 CPU 的优势来提升构建速度
        extractComments: false, // 禁用提取注释文件，避免冲突
        terserOptions: {
          compress: {
            drop_console: true, // 删除所有 console.* 语句
            drop_debugger: true // 删除所有 debugger 语句
          }
        }
      })
    ]
  }
})

module.exports = webpackProdConfig