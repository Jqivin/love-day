/**
 * 经期相关 API
 */
const express = require('express');
const router = express.Router();
const Period = require('../models/Period');
const { calcPeriodStatus, calcCalendarMonth } = require('../services/period');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/period/status
 */
router.get('/status', (req, res) => {
  try {
    const { openid } = req.query;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const row = Period.findByOpenid(openid);
    const settings = Period.toClient(row) || {
      lastPeriodStart: null,
      cycleLength: 28,
      periodLength: 5,
    };

    const status = calcPeriodStatus(
      {
        last_period_start: settings.lastPeriodStart,
        cycle_length: settings.cycleLength,
        period_length: settings.periodLength,
      },
      getToday()
    );

    res.json({
      code: 0,
      data: {
        settings,
        ...status,
      },
    });
  } catch (err) {
    console.error('获取经期状态失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * GET /api/period/calendar?openid=&year=&month=
 */
router.get('/calendar', (req, res) => {
  try {
    const { openid, year, month } = req.query;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const now = new Date();
    const y = parseInt(year, 10) || now.getFullYear();
    const m = parseInt(month, 10) || now.getMonth() + 1;

    const row = Period.findByOpenid(openid);
    const settings = Period.toClient(row) || {
      lastPeriodStart: null,
      cycleLength: 28,
      periodLength: 5,
    };

    const calendar = calcCalendarMonth(
      {
        last_period_start: settings.lastPeriodStart,
        cycle_length: settings.cycleLength,
        period_length: settings.periodLength,
      },
      y,
      m,
      getToday()
    );

    res.json({ code: 0, data: calendar });
  } catch (err) {
    console.error('获取日历失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * PUT /api/period/settings
 * Body: { openid, lastPeriodStart, cycleLength, periodLength }
 */
router.put('/settings', (req, res) => {
  try {
    const { openid, lastPeriodStart, cycleLength, periodLength } = req.body;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const row = Period.upsert(openid, { lastPeriodStart, cycleLength, periodLength });
    const settings = Period.toClient(row);
    const status = calcPeriodStatus(
      {
        last_period_start: settings.lastPeriodStart,
        cycle_length: settings.cycleLength,
        period_length: settings.periodLength,
      },
      getToday()
    );

    res.json({ code: 0, data: { settings, ...status } });
  } catch (err) {
    console.error('更新经期设置失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

/**
 * POST /api/period/log-today
 * 标记今天为经期开始
 */
router.post('/log-today', (req, res) => {
  try {
    const { openid } = req.body;
    if (!openid) {
      return res.status(400).json({ code: 400, message: '缺少 openid' });
    }

    const today = getToday();
    const row = Period.upsert(openid, { lastPeriodStart: today });
    const settings = Period.toClient(row);
    const status = calcPeriodStatus(
      {
        last_period_start: settings.lastPeriodStart,
        cycle_length: settings.cycleLength,
        period_length: settings.periodLength,
      },
      today
    );

    res.json({ code: 0, data: { settings, ...status } });
  } catch (err) {
    console.error('记录经期失败:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
