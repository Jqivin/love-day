/**
 * 经期设置模型
 */
const { getDb } = require('./db');

const Period = {
  findByOpenid(openid) {
    const db = getDb();
    return db.prepare('SELECT * FROM period_settings WHERE openid = ?').get(openid);
  },

  upsert(openid, { lastPeriodStart, cycleLength, periodLength }) {
    const db = getDb();
    const existing = this.findByOpenid(openid);

    if (existing) {
      db.prepare(`
        UPDATE period_settings
        SET last_period_start = COALESCE(?, last_period_start),
            cycle_length = COALESCE(?, cycle_length),
            period_length = COALESCE(?, period_length),
            updated_at = CURRENT_TIMESTAMP
        WHERE openid = ?
      `).run(lastPeriodStart, cycleLength, periodLength, openid);
    } else {
      db.prepare(`
        INSERT INTO period_settings (openid, last_period_start, cycle_length, period_length)
        VALUES (?, ?, ?, ?)
      `).run(
        openid,
        lastPeriodStart || null,
        cycleLength || 28,
        periodLength || 5
      );
    }

    return this.findByOpenid(openid);
  },

  /** 返回前端友好的字段名 */
  toClient(row) {
    if (!row) return null;
    return {
      lastPeriodStart: row.last_period_start,
      cycleLength: row.cycle_length,
      periodLength: row.period_length,
    };
  },
};

module.exports = Period;
