/**
 * 今日仪表盘聚合 API
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Period = require('../models/Period');
const { getWeather } = require('../services/weather');
const { calcPeriodStatus } = require('../services/period');
const { calcLoveDays } = require('./loveHelpers');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/dashboard/today
 * Query: ?openid=xxx&lat=&lon=&city=
 */
router.get('/today', async (req, res) => {
  try {
    const { openid, lat, lon, city } = req.query;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const user = User.findByOpenid(openid);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const today = getToday();
    const loveDays = calcLoveDays(user.love_start_date);

    const periodRow = Period.findByOpenid(openid);
    const periodSettings = Period.toClient(periodRow) || {
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: null,
    };
    const periodStatus = calcPeriodStatus(
      {
        last_period_start: periodSettings.lastPeriodStart,
        cycle_length: periodSettings.cycleLength,
        period_length: periodSettings.periodLength,
      },
      today
    );

    const weather = await getWeather(
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null,
      city
    );

    res.json({
      code: 0,
      data: {
        greeting: '每一天都值得被温柔对待',
        partner1Name: user.partner1_name,
        partner2Name: user.partner2_name,
        love: {
          days: loveDays,
          startDate: user.love_start_date,
          label: '我们在一起',
        },
        weather,
        period: {
          configured: periodStatus.configured,
          currentCycleDay: periodStatus.currentCycleDay,
          phaseName: periodStatus.phaseName,
          phaseLabel: periodStatus.phaseLabel,
        },
      },
    });
  } catch (err) {
    console.error('仪表盘加载失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
