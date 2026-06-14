/**
 * 用户模型
 */
const { getDb } = require('./db');

const User = {
  /**
   * 根据 openid 查找用户
   */
  findByOpenid(openid) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  },

  /**
   * 创建或更新用户信息
   */
  upsert(openid, { loveStartDate, partner1Name, partner2Name }) {
    const db = getDb();
    const existing = this.findByOpenid(openid);

    if (existing) {
      db.prepare(`
        UPDATE users
        SET love_start_date = ?, partner1_name = ?, partner2_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE openid = ?
      `).run(loveStartDate, partner1Name, partner2Name, openid);
    } else {
      db.prepare(`
        INSERT INTO users (openid, love_start_date, partner1_name, partner2_name)
        VALUES (?, ?, ?, ?)
      `).run(openid, loveStartDate, partner1Name, partner2Name);
    }

    return this.findByOpenid(openid);
  },

  /**
   * 获取所有已设置恋爱日期的用户（用于定时推送）
   */
  getAllActiveUsers() {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE love_start_date IS NOT NULL').all();
  },
};

module.exports = User;
