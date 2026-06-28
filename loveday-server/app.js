/**
 * 恋爱纪念日小程序 - 后端服务入口
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { startScheduler, manualPush } = require('./services/scheduler');

// 路由
const userRoutes = require('./routes/user');
const loveRoutes = require('./routes/love');
const subscribeRoutes = require('./routes/subscribe');
const dashboardRoutes = require('./routes/dashboard');
const periodRoutes = require('./routes/period');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/user', userRoutes);
app.use('/api/love', loveRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/period', periodRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 手动触发推送（调试用）
app.post('/api/admin/push', async (req, res) => {
  try {
    await manualPush();
    res.json({ code: 0, message: '推送任务已执行' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 启动服务
app.listen(config.port, () => {
  console.log(`恋爱纪念日后端服务已启动: http://localhost:${config.port}`);
  console.log(`健康检查: http://localhost:${config.port}/api/health`);

  // 启动定时推送任务
  startScheduler();
});
