/**
 * 数据库连接管理（单例）
 */
const Database = require('better-sqlite3');
const path = require('path');
const config = require('../config');

let db = null;

function getDb() {
  if (!db) {
    const dbPath = path.resolve(__dirname, '..', config.dbPath);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    const { migrate } = require('../database/migrate');
    migrate(db);
  }
  return db;
}

module.exports = { getDb };
