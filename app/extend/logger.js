const log4js = require('log4js');

/**
 * 日志工具
 * 外部调用 app.logger.info app.logger.error
 */
module.exports = (app) => { 
  let logger;

  // 根据运行环境选择不同的日志记录方式
  if (app.env.isLocal()){
    // 本地开发环境：直接使用控制台输出日志
    logger = console;
  }else {
     // 生产或测试环境：使用 log4js 记录日志并保存到磁盘文件中
    log4js.configure({  
      // 配置日志输出方式（追加器）
      appenders: {
        // 控制台输出
        console:{
          type: 'console'
        },
        // 文件输出，按日期切分日志文件
        dateFile: {
          type: 'dateFile',
          filename: './logs/applocation.log', // 日志文件路径和基本名称
          pattern: 'yyyy-MM-dd' // 按天切分文件的模式
        }
      },
       // 配置日志分类和级别
      categories: {
        default: {
          appenders: ['console', 'dateFile'],// 同时输出到控制台和文件
          level: 'trace'  // 记录所有级别的日志（trace 是最低级别）
        }
      }
    });
    // 获取默认分类的日志记录器实例
    logger = log4js.getLogger();
  }
  // 返回配置好的日志记录器
  return logger;
}