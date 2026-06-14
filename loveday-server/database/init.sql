-- 恋爱纪念日小程序 - 数据库初始化
-- 使用 SQLite，此文件作为参考文档和手动初始化使用

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(64) NOT NULL UNIQUE,
    love_start_date DATE NOT NULL,
    partner1_name VARCHAR(32) DEFAULT 'TA',
    partner2_name VARCHAR(32) DEFAULT '我',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 订阅消息记录表
CREATE TABLE IF NOT EXISTS subscribe_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(64) NOT NULL,
    template_id VARCHAR(64) NOT NULL,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_subscribe_openid ON subscribe_logs(openid);
