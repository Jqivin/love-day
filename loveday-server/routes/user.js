/**
 * 用户相关 API 路由
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { code2Session } = require('../services/wechat');

/**
 * POST /api/user/login
 * 微信登录，code 换取 openid，获取或创建用户
 * Body: { code }
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, message: '缺少 code' });
    }

    // 调用微信接口，code 换取 openid
    const { openid } = await code2Session(code);

    let user = User.findByOpenid(openid);
    const isNew = !user;

    if (isNew) {
      user = User.upsert(openid, {
        loveStartDate: new Date().toISOString().slice(0, 10),
        partner1Name: 'TA',
        partner2Name: '我',
      });
    }

    res.json({ code: 0, data: { user, isNew, openid } });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ code: 500, message: err.message || '服务器错误' });
  }
});

/**
 * PUT /api/user/settings
 * 更新用户设置（恋爱日期、昵称）
 * Body: { openid, loveStartDate, partner1Name, partner2Name }
 */
router.put('/settings', (req, res) => {
  try {
    const { openid, loveStartDate, partner1Name, partner2Name } = req.body;

    if (!openid || !loveStartDate) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' });
    }

    const user = User.upsert(openid, {
      loveStartDate,
      partner1Name: partner1Name || 'TA',
      partner2Name: partner2Name || '我',
    });

    res.json({ code: 0, data: { user } });
  } catch (err) {
    console.error('更新设置失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/user/info
 * 获取用户信息
 * Query: ?openid=xxx
 */
router.get('/info', (req, res) => {
  try {
    const { openid } = req.query;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const user = User.findByOpenid(openid);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 0, data: { user } });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
