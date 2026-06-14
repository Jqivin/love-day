/**
 * 订阅消息相关 API 路由
 */
const express = require('express');
const router = express.Router();
const SubscribeLog = require('../models/SubscribeLog');

/**
 * POST /api/subscribe/record
 * 记录用户订阅消息授权
 * Body: { openid, templateIds: ['template_id_1', ...] }
 */
router.post('/record', (req, res) => {
  try {
    const { openid, templateIds } = req.body;

    if (!openid || !templateIds || !Array.isArray(templateIds)) {
      return res.status(400).json({ code: 400, message: '缺少参数' });
    }

    for (const tid of templateIds) {
      SubscribeLog.record(openid, tid);
    }

    res.json({ code: 0, message: '订阅记录已保存' });
  } catch (err) {
    console.error('记录订阅失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/subscribe/status
 * 查询用户的订阅状态
 * Query: ?openid=xxx&templateId=xxx
 */
router.get('/status', (req, res) => {
  try {
    const { openid, templateId } = req.query;

    if (!openid || !templateId) {
      return res.status(400).json({ code: 400, message: '缺少参数' });
    }

    const subscribed = SubscribeLog.hasSubscribed(openid, templateId);
    res.json({ code: 0, data: { subscribed } });
  } catch (err) {
    console.error('查询订阅状态失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
