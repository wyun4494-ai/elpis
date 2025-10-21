// 本地开发启动 deserver
const express = require('express');
const consoler = require('consoler');
const webpack = require('webpack');
const path = require('path');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = () => {
  const {
    webpackDevConfig,
    DEV_SERVER_CONFIG
  } = require('./config/webpack.dev.js');
  
  const app = express();
  
  const compiler = webpack(webpackDevConfig);
  
  // 构建静态文件目录
  app.use(express.static(path.join(process.cwd(), './app/public/dist')))
  
  // 引用 devMiddleware 中间件 监控文件改动
  app.use(devMiddleware(compiler, {
    // 落地文件
    writeToDisk: (filePath) => {
      // 只有以.tpl结尾的文件才写入磁盘，其余文件存储在内存中
      return  filePath.endsWith('.tpl')
    },
    // 资源路径
    publicPath: webpackDevConfig.output.publicPath,
  
    // headers 配置
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    stats:{
      colors: true
    }
  }))
  
  // 引用 hotMiddleware 中间件 实现热更新通讯
  app.use(hotMiddleware(compiler, {
    path: `${DEV_SERVER_CONFIG.HMR_PATH}`,
    log: () => {
    },
    // 添加 CORS 配置
    heartbeat: 10 * 1000
  }))
  
  // 为 HMR 路径添加 CORS 头
  app.use(`${DEV_SERVER_CONFIG.HMR_PATH}`, (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
  });
  
  consoler.info('请等待webpack初次构建完成提示......')
  
  // 启动dev-server服务
  const post = DEV_SERVER_CONFIG.PORT;
  app.listen(post, () => {
    consoler.info(`webpack-dev-server is listening on port ${post}`)
  });
}


