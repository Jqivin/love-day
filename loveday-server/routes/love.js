/**
 * 恋爱数据相关 API 路由
 * 提供天数计算、纪念日列表、每日问候语
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 每日情话语录
const GREETINGS = [
  '每一天都是新的开始，因为有你，每一天都变得特别。',
  '世界上最美好的事，就是和你在一起的每一天。',
  '你是我的今天，也是我所有的明天。',
  '遇见你，是我这辈子最美丽的意外。',
  '有你的日子，每一天都是情人节。',
  '时间会把陪伴熬成最美的情话。',
  '我的心很小，装下一个你刚刚好。',
  '你是我的不可或缺，也是我的独一无二。',
  '生活因你而温暖，岁月因你而温柔。',
  '和你在一起的时光，是我最珍贵的宝藏。',
  '爱你，是我做过最好的事。',
  '你的笑容，是我每天最想看到的风景。',
  '不是因为需要你才爱你，而是因为爱你才需要你。',
  '你是我平凡生活中的英雄梦想。',
  '最好的爱情，是两个人在一起变得更好。',
  '余生很长，但有你刚刚好。',
  '想和你一起，从清晨到日暮，从青丝到白发。',
  '你就像阳光，照进了我所有的日子里。',
  '和你在一起的每一天，都值得被铭记。',
  '世界那么大，遇见你不容易，所以要好好珍惜。',
];

/**
 * 计算恋爱天数（从 love_start_date 到今天）
 */
function calcLoveDays(startDateStr) {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

/**
 * 获取今日问候语（根据天数固定，保证同一天同一句话）
 */
function getDailyGreeting(days) {
  const index = days % GREETINGS.length;
  return GREETINGS[index];
}

/**
 * 计算纪念日列表
 */
function calcAnniversaries(startDateStr) {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const loveDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  const anniversaries = [];

  // 1. 整百天纪念日（100, 200, 300...）
  const nextHundred = Math.ceil(loveDays / 100) * 100;
  for (let d = 100; d <= nextHundred + 500; d += 100) {
    const date = new Date(start);
    date.setDate(date.getDate() + d);
    anniversaries.push({
      type: 'hundred',
      typeName: '整百天纪念日',
      label: `${d}天`,
      days: d,
      date: date.toISOString().slice(0, 10),
      isPast: d <= loveDays,
      remainingDays: d - loveDays,
    });
  }

  // 2. 周年纪念日
  const yearsPassed = Math.floor(loveDays / 365);
  for (let y = 1; y <= yearsPassed + 2; y++) {
    const date = new Date(start);
    date.setFullYear(date.getFullYear() + y);
    const diffFromStart = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    anniversaries.push({
      type: 'yearly',
      typeName: '周年纪念日',
      label: `${y}周年`,
      days: diffFromStart,
      date: date.toISOString().slice(0, 10),
      isPast: diffFromStart <= loveDays,
      remainingDays: diffFromStart - loveDays,
    });
  }

  // 3. 每月纪念日（每30天，恋爱月）
  const monthsPassed = Math.floor(loveDays / 30);
  for (let m = 1; m <= monthsPassed + 2; m++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + m);
    // 处理月末溢出（如1月31日 → 2月28日）
    if (date.getDate() !== start.getDate()) {
      date.setDate(0); // 回退到上月最后一天
    }
    const diffFromStart = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    anniversaries.push({
      type: 'monthly',
      typeName: '月度纪念日',
      label: `${m}个月`,
      days: diffFromStart,
      date: date.toISOString().slice(0, 10),
      isPast: diffFromStart <= loveDays,
      remainingDays: diffFromStart - loveDays,
    });
  }

  // 按剩余天数排序
  anniversaries.sort((a, b) => a.remainingDays - b.remainingDays);

  return anniversaries;
}

/**
 * GET /api/love/info
 * 获取恋爱信息（天数、问候语、纪念日列表）
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
      return res.status(404).json({ code: 404, message: '用户不存在，请先登录' });
    }

    const loveDays = calcLoveDays(user.love_start_date);
    const greeting = getDailyGreeting(loveDays);
    const anniversaries = calcAnniversaries(user.love_start_date);

    // 下一个纪念日
    const nextAnniversary = anniversaries.find(a => a.remainingDays > 0);

    res.json({
      code: 0,
      data: {
        loveDays,
        loveStartDate: user.love_start_date,
        partner1Name: user.partner1_name,
        partner2Name: user.partner2_name,
        greeting,
        anniversaries,
        nextAnniversary: nextAnniversary || null,
      },
    });
  } catch (err) {
    console.error('获取恋爱信息失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
