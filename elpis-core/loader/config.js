const path = require('path')
const { sep } = path


/**
 * config loader
 * @param {object} app koa 实例
 * 
 * 通过区别  本地/测试/生产，通过env环境读取不同文件配置 env.config
 * 通过env.config 覆盖 default.config 加载到 app.config 中
 * 
 * 目录下对应的 config配置
 * 默认配置 config/config.default.js
 * 本地配置 config/config.local.js
 * 测试配置 config/config.beta.js
 * 生产配置 config/config.prod.js
 */
module.exports = (app) => {
  // 找到config目录
  const configPath = path.resolve(app.baseDir, `.${sep}config`);
  // 获取default.config
  let defaultConfig = {};
  try {
    defaultConfig = require(path.resolve(configPath, `.${sep}config.default.js`));
  } catch (e) {
    console.log('[exception] there is no default.config.js');
  }
  // 获取env.config
  let envConfig = {};
  try {
    if (app.env.isLocal()) { // 本地
      envConfig = require(path.resolve(configPath, `.${sep}config.local.js`));
    } else if (app.env.isBeta()) { // 测试
      envConfig = require(path.resolve(configPath, `.${sep}config.beta.js`));
    } else if (app.env.isProduction()) { // 生产
      envConfig = require(path.resolve(configPath, `.${sep}config.prod.js`));
    }
  } catch (e) {
    console.log('[exception] there is no env.config.js');
  }
  // 覆盖并加载 config 配置
  app.config = Object.assign({}, defaultConfig, envConfig);
}