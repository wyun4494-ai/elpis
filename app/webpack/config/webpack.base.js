const path = require("path");
const { VueLoaderPlugin } = require('vue-loader');
const  webpack = require("webpack");
const  HtmlWebpackPlugin  = require('html-webpack-plugin');
const  glob  = require("glob");

// 获取elpis的node_modules路径
const elpisNodeModulesPath = path.resolve(__dirname, '../../../node_modules');

// 动态构造 entry 和 HtmlWebpackPluginList
const pageEntries = {}
const HtmlWebpackPluginList = []
// 获取./../pages 目录下所有入口文件（entry.xx.js）
const entryList = path.resolve(__dirname, '../../pages/**/entry.*.js');
console.log(entryList)
glob.sync(entryList).forEach(file => {
  // 构造 entry
  const entryName = path.basename(file, '.js')
  pageEntries[entryName] = file
  // 构造 HtmlWebpackPlugin 最终渲染的页面文件
  HtmlWebpackPluginList.push(
    // html-webpack-plugin 辅助注入打包后的 bundle 文件到 tpl中
    new HtmlWebpackPlugin({
    // 模板文件路径  
    filename: path.resolve(process.cwd(), './app/public/dist',`${entryName}.tpl`),
    // 指定要使用的模板文件
    template: path.resolve(__dirname, '../../view/entry.tpl'),
    // 要注入的代码块  
    chunks:[ `${entryName}`]
    })
  )
})


/**
 * webpack 基础配置
 */
module.exports = { 
  // 添加 mode 配置以解决警告
  mode: 'production',
  
  // entry（入口）：指定 webpack 构建依赖图的开始点
  // webpack 会从这个点开始，递归地构建模块依赖关系图
  entry: pageEntries,

  // module（模块）：配置如何处理项目中的不同类型模块
  // 例如如何处理 CSS、图片、字体等非 JavaScript 模块
  module: {
    rules: [{
      test: /\.vue$/,
      use: {
        loader: path.resolve(elpisNodeModulesPath, 'vue-loader')
      }
    }, {
      test: /\.js$/,
      include: [
        // 只对指定的路径下的 .js 文件进行 babel 转换
        path.resolve(__dirname, '../../pages')
      ],
      use: {
        loader: path.resolve(elpisNodeModulesPath, 'babel-loader'),
        options: {
          sourceType: 'module',
          // 添加配置以正确处理 ES6 模块
        presets: [
          [path.resolve(elpisNodeModulesPath, '@babel/preset-env'), {
            // 移除 modules: false 配置，让 Babel 自动处理模块转换
            targets: {
              browsers: ['last 2 versions', 'ie >= 11']
            },
          }]
        ],
        plugins: [
          path.resolve(elpisNodeModulesPath, '@babel/plugin-transform-runtime')
        ]
        }
      }
    }, {
        test: /\.(mjs|js)$/,
        type: 'javascript/auto', // 自动识别模块类型
        include: [
          path.resolve(__dirname, '../../pages')
        ],
        use: path.resolve(elpisNodeModulesPath, 'babel-loader') // 复用已配置的 babel-loader
      }, {
      test: /\.(png|jpe?g|gif)(\?.+)?$/,
      use: {
        loader: path.resolve(elpisNodeModulesPath, 'url-loader'),
        options: {
          limit: 300,
          esModule: false
        }
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: path.resolve(elpisNodeModulesPath, 'style-loader')
      }, {
        loader: path.resolve(elpisNodeModulesPath, 'css-loader')
      }]
    }, {
      test: /\.less$/,
      use: [{
        loader: path.resolve(elpisNodeModulesPath, 'style-loader')
      }, {
        loader: path.resolve(elpisNodeModulesPath, 'css-loader')
      }, {
        loader: path.resolve(elpisNodeModulesPath, 'less-loader')
      }]
    }, {
      test: /\.[eot|svg|ttf|woff|woff2]$/,
      use: {
        loader: path.resolve(elpisNodeModulesPath, 'file-loader')
      }
    }]
  },
  
  // output（出口）：指定 webpack 如何输出编译后的文件以及输出到哪里
  // 因为开发和生产环境输出不一致，所以在各自环境下配置
  output: {},

  // 配置 模块解析时的具体行为（定义在webpack在打包时，如何找到并解析具体模块的路径）
  // 例如设置模块查找目录、文件扩展名、别名等
  resolve: {
    extensions: ['.js', '.vue', '.css', '.less'],
    alias: {
      $page: path.resolve(__dirname, '../../pages'),
      $common: path.resolve(__dirname, '../../pages/common'),
      $widgets: path.resolve(__dirname, '../../pages/widgets'),
      $store:  path.resolve(__dirname, '../../pages/store'),
    },
    // 添加 fallback 配置以解决 Node.js 核心模块在浏览器环境中的问题
      fallback: {
        "process": false
      }
  },


  // plugins（插件）：用于执行更广泛的任务，比如打包优化、环境变量注入等
  // 插件功能更强大，可以处理整个构建过程中的各种任务
  plugins: [
    // 处理 .vue 文件，这个插件时必须的
    // 将你在 webpack 配置中定义的其他规则复制并应用到 .vue 文件
    new VueLoaderPlugin(),

    new webpack.ProvidePlugin({
      // 配置第三方库暴露到 window context 下 
      Vue: 'vue',
      axios: 'axios',
      _: 'lodash'
    }),

    new webpack.DefinePlugin({
      // 定义全局变量
      __VUE_OPTIONS_API__: 'true', // 支持 vue 解析Options API 
      __VUE_PROD_DEVTOOLS__: 'false', // 禁用 vue 的调试工具
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' // 禁用生产环境显示 "水合"信息
    }),

    // 构造最终渲染的页面模板
    ...HtmlWebpackPluginList
  ],
  

  //  用于控制 webpack 的代码分割、压缩、作用域提升等优化功能
  optimization: {
    /**
     * 把js代码打包成3种类型
     * 1. vendor：第三方 lib 库，基本不会改动，除非依赖版本升级
     * 2. common：业务组件代码的公共部分抽取出来，改动较少
     * 2. entry.{page}: 不用页面 entry 里的业务组件代码的差异部分， 会经常改动
     * 目的：把改动和引用频率不一样的 js文件区分出来，以达到更好利用浏览器缓存的效果
     */
    splitChunks: {
      // 对所有类型的 chunks 进行代码分割优化（包括同步和异步加载的模块）
      chunks: 'all', 
      // 按需加载时的最大并行请求数为 10（控制动态导入时能同时加载的 chunk 数量）
      maxAsyncRequests: 10,
      // 入口点初始加载时的最大并行请求数为 10（控制首屏加载时能同时加载的 chunk 数量）
      maxInitialRequests: 10,
      // 缓存组配置（定义不同类型的模块如何分组打包）
      cacheGroups: {
        // 第三方库缓存组（处理 node_modules 中的第三方依赖）
        vendor: {
          // 匹配 node_modules 目录下的所有模块（跨平台兼容路径分隔符）
          test: /[\\/]node_modules[\\/]/,
          // 将匹配的模块打包到名为 vendor 的 chunk 中
          name: 'vendor',
          // 设置缓存组优先级为 20（数值越大优先级越高）
          priority: 20,
          // 强制执行此缓存组（忽略全局 minSize、minChunks 等限制条件）
          enforce: true,
          // 如果已存在包含相同模块的 chunk，则重用它而不是创建新的
          reuseExistingChunk: true
        },
        common: { // 公共模块
          test: /[\\/]common|widgets[\\/]/, // 匹配 common 或 widgets 目录下的模块为公共模块
          name: 'common', // 模块名称
          minChunks: 2, //  引用过两次即被归为公共模块
          minSize: 1, // 最小分割文件
          priority:   10, // 优先级
          reuseExistingChunk: true // 复用已有的公共 chunk
        }
      }
    },
    // 将 webpack 运行时生成的代码打包到 runtime.js 中
    runtimeChunk: true
  },
    // 添加实验性功能支持ES6模块
    experiments: {
    topLevelAwait: true,
  },

}