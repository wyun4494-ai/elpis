const path = require("path");
const { VueLoaderPlugin } = require('vue-loader');
const  webpack = require("webpack");
const  HtmlWebpackPlugin  = require('html-webpack-plugin');
const  glob  = require("glob");
const merge = require('webpack-merge')
const fs = require('fs')

// 获取elpis的node_modules路径
// const elpisNodeModulesPath = path.resolve(__dirname, '../../../node_modules');


// 动态构造 elpisPageEntries 和 elpisHtmlWebpackPluginList
const elpisPageEntries = {}
const elpisHtmlWebpackPluginList = []
// 获取 elpis/app/pages 目录下所有入口文件（entry.xx.js）
const elpisEntryList = path.resolve(__dirname, '../../pages/**/entry.*.js');
glob.sync(elpisEntryList).forEach(file => {
  handleFile(file, elpisPageEntries, elpisHtmlWebpackPluginList)
})

// 动态构造 businessPageEntries 和 businessHtmlWebpackPluginList
const businessPageEntries = {}
const businessHtmlWebpackPluginList = []
// 获取 business/app/pages 目录下所有入口文件（entry.xx.js）
const businessEntryList = path.resolve(process.cwd(), './app/pages/**/entry.*.js');
glob.sync(businessEntryList).forEach(file => {
  handleFile(file, businessPageEntries, businessHtmlWebpackPluginList)
})

// 构造相关 webpack 处理的数据结构
function handleFile(file, entries = {}, htmlWebpackPluginList = []) {
  // 构造 entry
  const entryName = path.basename(file, '.js')
  entries[entryName] = file
  // 构造 HtmlWebpackPlugin 最终渲染的页面文件
  htmlWebpackPluginList.push(
    // html-webpack-plugin 辅助注入打包后的 bundle 文件到 tpl中
    new HtmlWebpackPlugin({
    // 模板文件路径
    filename: path.resolve(process.cwd(), './app/public/dist',`${entryName}.tpl`),
    // 指定要使用的模板文件
    template: path.resolve(__dirname, '../../view/entry.tpl'),
    // 要注入的代码块
    chunks:[ `${entryName}`],
    // 默认注入到 body 底部
    inject: true
    })
  )
}

// 加载 业务 webpack 配置
let businessWebpackConfig = {}
try {
  businessWebpackConfig = require(`${process.cwd()}/app/webpack.config.js`)
}catch(e){
  console.log('加载 业务 webpack 配置失败', e)
}
/**
 * webpack 基础配置
 */
module.exports = merge.smart({
  // 添加 mode 配置以解决警告
  mode: 'production',
  
  // entry（入口）：指定 webpack 构建依赖图的开始点
  // webpack 会从这个点开始，递归地构建模块依赖关系图
  entry: Object.assign(elpisPageEntries, businessPageEntries),

  // module（模块）：配置如何处理项目中的不同类型模块
  // 例如如何处理 CSS、图片、字体等非 JavaScript 模块
  module: {
    rules: [{
      test: /\.vue$/,
      use: {
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            whitespace: 'preserve'
          },
          // 修复 Windows 路径问题：配置 PostCSS 处理
          // 禁用 PostCSS 的 URL 处理，避免 Windows 路径中的反斜杠被误解
          postcss: {
            // 使用空的 PostCSS 配置，不处理任何 CSS
            plugins: [],
            // 禁用 PostCSS 的 URL 处理
            exec: false
          }
        }
      }
    }, {
      test: /\.js$/,
      include: [
        // 只对指定的elpis路径下的 .js 文件进行 babel 转换
        path.resolve(__dirname, '../../pages'),
        // 只对指定的业务路径下的 .js 文件进行 babel 转换
        path.resolve(process.cwd(), './app/pages')
      ],
      use: {
        loader: 'babel-loader',
        options: {
          sourceType: 'module',
          // 添加配置以正确处理 ES6 模块
        presets: [
          ['@babel/preset-env', {
            // 移除 modules: false 配置，让 Babel 自动处理模块转换
            targets: {
              browsers: ['last 2 versions', 'ie >= 11']
            },
          }]
        ],
        plugins: [
          '@babel/plugin-transform-runtime'
        ]
        }
      }
    }, {
        test: /\.(mjs|js)$/,
        type: 'javascript/auto', // 自动识别模块类型
        include: [
          path.resolve(__dirname, '../../pages')
        ],
        use: 'babel-loader' // 复用已配置的 babel-loader
      }, {
      test: /\.(png|jpe?g|gif)(\?.+)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 300,
          esModule: false
        }
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          esModule: false,
          sourceMap: false
        }
      }]
    }, {
      test: /\.less$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          esModule: false,
          sourceMap: false
        }
      }, {
        loader: 'less-loader',
        options: {
          sourceMap: false
        }
      }]
    }, {
      test: /\.[eot|svg|ttf|woff|woff2]$/,
      use: {
        loader: 'file-loader'
      }
    }]
  },
  
  // output（出口）：指定 webpack 如何输出编译后的文件以及输出到哪里
  // 因为开发和生产环境输出不一致，所以在各自环境下配置
  output: {},

  // 配置 模块解析时的具体行为（定义在webpack在打包时，如何找到并解析具体模块的路径）
  // 例如设置模块查找目录、文件扩展名、别名等
  resolve: {
    // 配置模块查找目录，优先查找业务项目的 node_modules，然后查找 elpis 的 node_modules
    modules: [
      path.resolve(process.cwd(), 'node_modules'),  // 业务项目的 node_modules
      path.resolve(__dirname, '../../../node_modules'),  // elpis 的 node_modules
      'node_modules'  // 默认 node_modules
    ],
    extensions: ['.js', '.vue', '.css', '.less'],
    alias: (() => {
      const aliasMap = {}
      const blankModulePath = path.resolve(__dirname, '../libs/blank.js')

      // dashboard 业务扩展路由
      const businessDashboardConfig = path.resolve(process.cwd(), './app/pages/dashboard/router.js')
      aliasMap['$businessDashboardConfig'] = fs.existsSync(businessDashboardConfig) ? businessDashboardConfig : blankModulePath

      // schema-view 业务扩展 component 配置
      const businessSchemaViewConfig = path.resolve(process.cwd(), './app/pages/dashboard/complex-view/schema-view/components/component-config.js')
      aliasMap['$businessComponentConfig'] = fs.existsSync(businessSchemaViewConfig) ? businessSchemaViewConfig : blankModulePath

      // schema-form 业务扩展  配置
      const businessFormItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-form/form-item-config.js')
      aliasMap['$businessFormItemConfig'] = fs.existsSync(businessFormItemConfig) ? businessFormItemConfig : blankModulePath

      // schema-search-bar 业务扩展 配置
      const businessSearchItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-search-bar/search-item-config.js')
      aliasMap['$businessSearchItemConfig'] = fs.existsSync(businessSearchItemConfig) ? businessSearchItemConfig : blankModulePath

      // header-container 业务扩展 配置
      const businessHeaderConfig = path.resolve(process.cwd(), './app/pages/widgets/header-container/header-config.js')
      aliasMap['$businessHeaderConfig'] = fs.existsSync(businessHeaderConfig) ? businessHeaderConfig : blankModulePath

      // detail-panel 业务扩展 配置
      const businessDetailPanelConfig = path.resolve(process.cwd(), './app/pages/widgets/detail-panel/detail-panel-config.js')
      aliasMap['$businessDetailPanelConfig'] = fs.existsSync(businessDetailPanelConfig) ? businessDetailPanelConfig : blankModulePath

      return {
        'vue': 'vue',
        $elpisPage: path.resolve(__dirname, '../../pages'),
        $elpisCommon: path.resolve(__dirname, '../../pages/common'),
        $elpisCurl: path.resolve(__dirname, '../../pages/common/curl'),
        $elpisUtils: path.resolve(__dirname, '../../pages/common/utils'),
  
        $elpisWidgets: path.resolve(__dirname, '../../pages/widgets'),
        $elpisHeaderContainer: path.resolve(__dirname, '../../pages/widgets/header-container/header-container.vue'),
        $elpisSchemaTable: path.resolve(__dirname, '../../pages/widgets/schema-table/schema-table.vue'),
        $elpisSchemaForm: path.resolve(__dirname, '../../pages/widgets/schema-form/schema-form.vue'),
        $elpisSchemaSearchBar: path.resolve(__dirname, '../../pages/widgets/schema-search-bar/schema-search-bar.vue'),
  
        $elpisBoot: path.resolve(__dirname, '../../pages/boot.js'),
        $elpisStore:  path.resolve(__dirname, '../../pages/store'),
        ...aliasMap
      }
    })(),
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
    ...elpisHtmlWebpackPluginList,
    ...businessHtmlWebpackPluginList
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

},businessWebpackConfig)