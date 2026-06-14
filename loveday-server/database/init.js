/**
 * 数据库初始化脚本
 * 运行: node database/init.js
 */
const Database = require('better-sqlite3');
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, 'love_days.db');
const db = new Database(dbPath);

// 启用 WAL 模式提升性能
db.pragma('journal_mode = WAL');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid VARCHAR(64) NOT NULL UNIQUE,
      love_start_date DATE NOT NULL,
      partner1_name VARCHAR(32) DEFAULT 'TA',
      partner2_name VARCHAR(32) DEFAULT '我',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscribe_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid VARCHAR(64) NOT NULL,
      template_id VARCHAR(64) NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
  CREATE INDEX IF NOT EXISTS idx_subscribe_openid ON subscribe_logs(openid);
`);

console.log('数据库初始化完成:', dbPath);
db.close();
