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
  // elpis目录的config配置
  const elpisConfigPath = path.resolve(__dirname, `..${sep}..${sep}config`);
  // 获取elpis目录的default.config
  let defaultConfig = require(path.resolve(elpisConfigPath, `.${sep}config.default.js`));

  // 业务目录的config配置
  const businessConfigPath = path.resolve(process.cwd(), `.${sep}config`);

  try {
    defaultConfig = {
      ...defaultConfig,
      ...require(path.resolve(businessConfigPath, `.${sep}config.default.js`))
    }
  } catch (e) {
    console.log(`[exception] there is no default.config.js:${e.message})`);
    console.debug(`[exception] Stack trace: ${e.stack}`); 
  }
  // 获取env.config
  let envConfig = {};
  try {
    if (app.env.isLocal()) { // 本地
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.local.js`));
    } else if (app.env.isBeta()) { // 测试
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.beta.js`));
    } else if (app.env.isProduction()) { // 生产
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.prod.js`));
    }
  } catch (e) {
      const envName = app.env.isLocal() ? 'local' : app.env.isBeta() ? 'beta' : 'prod';
      console.log(`[exception] Failed to load config.${envName}.js: ${e.message}`);
      console.debug(`[exception] Stack trace: ${e.stack}`);
  }
  // 覆盖并加载 config 配置
  app.config = Object.assign({}, defaultConfig, envConfig);
}