const superagent = require('superagent');

/**
 * Service 基类
 * 统一收拢 Service 相关的公共方法，提供数据库访问和 HTTP 请求能力
 *
 * @class BaseService
 */
module.exports = (app) => class BaseService {
  /**
   * 构造函数
   * 初始化 app 实例、配置对象和 HTTP 请求工具
   */
  constructor() {
    this.app = app;
    this.config = app.config;
    this.curl = superagent; // HTTP 请求工具（superagent）
  }
}
