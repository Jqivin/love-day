/**
 * 数据库迁移 - 启动时自动创建新表
 */
function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS period_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid VARCHAR(64) NOT NULL UNIQUE,
      last_period_start DATE,
      cycle_length INTEGER DEFAULT 28,
      period_length INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_period_openid ON period_settings(openid);
  `);
}

module.exports = { migrate };
