/**
 * Controller 基类
 * 统一收拢 Controller 相关的公共方法，提供统一的响应格式
 *
 * @class BaseController
 */
module.exports = (app) => class BaseController {
  /**
   * 构造函数
   * 初始化 app 实例和配置对象
   */
  constructor() {
    this.app = app;
    this.config = app.config;
  }

  /**
   * API 处理成功时统一返回结构
   *
   * @param {Object} ctx - Koa 上下文对象
   * @param {Object} data - 核心数据（业务数据）
   * @param {Object} metadata - 附加数据（如分页信息、总数等）
   * @returns {void}
   *
   * @example
   * this.success(ctx, productList, { total: 100, page: 1, pageSize: 10 });
   */
  success(ctx, data = {}, metadata = {}) {
    ctx.status = 200;
    ctx.body = {
      success: true,
      data,
      metadata
    }
  }

  /**
   * API 处理失败时统一返回结构
   *
   * @param {Object} ctx - Koa 上下文对象
   * @param {string} message - 错误信息
   * @param {number} code - HTTP 状态码（如 400、404、500）
   * @returns {void}
   *
   * @example
   * this.fail(ctx, '商品不存在', 404);
   */
  fail(ctx, message, code) {
    ctx.body = {
      success: false,
      message,
      code
    }
  }
}