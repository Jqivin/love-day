/**
 * 后端配置文件
 * 实际部署时，敏感信息建议使用环境变量
 */
module.exports = {
  // 服务器端口
  port: process.env.PORT || 3000,

  // 微信小程序配置（需要替换为实际的 AppID 和 AppSecret）
  wechat: {
    appId: process.env.WECHAT_APPID || 'your_appid_here',
    appSecret: process.env.WECHAT_SECRET || 'your_secret_here',
  },

  // 数据库路径（SQLite）
  dbPath: process.env.DB_PATH || './database/love_days.db',

  // 订阅消息模板ID（需要在微信公众平台申请）
  templates: {
    dailyGreeting: process.env.TPL_DAILY || 'your_daily_template_id',
    anniversary: process.env.TPL_ANNIVERSARY || 'your_anniversary_template_id',
  },

  // 每日推送时间（cron 表达式，默认早上9:00）
  dailyPushCron: process.env.PUSH_CRON || '0 9 * * *',
};
