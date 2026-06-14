/**
 * 订阅消息记录模型
 */
const { getDb } = require('./db');

const SubscribeLog = {
  /**
   * 记录用户订阅
   */
  record(openid, templateId) {
    const db = getDb();
    db.prepare(`
      INSERT INTO subscribe_logs (openid, template_id) VALUES (?, ?)
    `).run(openid, templateId);
  },

  /**
   * 查询用户是否订阅了某个模板
   */
  hasSubscribed(openid, templateId) {
    const db = getDb();
    const row = db.prepare(`
      SELECT id FROM subscribe_logs
      WHERE openid = ? AND template_id = ?
      ORDER BY subscribed_at DESC LIMIT 1
    `).get(openid, templateId);
    return !!row;
  },

  /**
   * 获取所有订阅了指定模板的用户 openid 列表
   */
  getSubscribedOpenids(templateId) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT openid FROM subscribe_logs WHERE template_id = ?
    `).all(templateId);
    return rows.map(r => r.openid);
  },
};

module.exports = SubscribeLog;
