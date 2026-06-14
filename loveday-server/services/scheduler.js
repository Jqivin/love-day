/**
 * 定时任务调度器
 * 负责：每日推送、整百天纪念日、周年纪念日、每月纪念日提醒
 */
const cron = require('node-cron');
const config = require('../config');
const User = require('../models/User');
const SubscribeLog = require('../models/SubscribeLog');
const { sendSubscribeMessage } = require('./wechat');

// 每日情话语录（与 love.js 路由保持同步）
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
 * 计算恋爱天数
 */
function calcLoveDays(startDateStr) {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

/**
 * 获取当日问候语
 */
function getDailyGreeting(days) {
  return GREETINGS[days % GREETINGS.length];
}

/**
 * 判断是否是特殊纪念日
 * 返回纪念日类型数组
 */
function getSpecialDays(startDateStr) {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const loveDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const specialDays = [];

  // 整百天
  if (loveDays > 0 && loveDays % 100 === 0) {
    specialDays.push({ type: 'hundred', label: `${loveDays}天纪念日`, days: loveDays });
  }

  // 周年（同月同日）
  if (
    loveDays > 0 &&
    today.getMonth() === start.getMonth() &&
    today.getDate() === start.getDate()
  ) {
    const years = today.getFullYear() - start.getFullYear();
    if (years > 0) {
      specialDays.push({ type: 'yearly', label: `${years}周年纪念日`, days: loveDays });
    }
  }

  // 每月纪念日（同一天）
  if (loveDays > 0 && today.getDate() === start.getDate()) {
    const months =
      (today.getFullYear() - start.getFullYear()) * 12 +
      (today.getMonth() - start.getMonth());
    if (months > 0) {
      specialDays.push({ type: 'monthly', label: `${months}个月纪念日`, days: loveDays });
    }
  }

  return specialDays;
}

/**
 * 为单个用户发送每日推送
 */
async function sendDailyPush(user) {
  const loveDays = calcLoveDays(user.love_start_date);
  const greeting = getDailyGreeting(loveDays);
  const specialDays = getSpecialDays(user.love_start_date);

  // 检查是否订阅了每日问候模板
  const hasDailySub = SubscribeLog.hasSubscribed(user.openid, config.templates.dailyGreeting);
  if (!hasDailySub) {
    console.log(`用户 ${user.openid} 未订阅每日推送模板，跳过`);
    return;
  }

  // 构建模板数据（字段名需要与实际微信模板匹配，这里使用常见字段）
  let templateData = {
    thing1: { value: `${user.partner1_name} ❤️ ${user.partner2_name}` },
    number2: { value: `${loveDays}天` },
    thing3: { value: greeting.substring(0, 20) },
  };

  // 如果有特殊纪念日，使用纪念日模板
  if (specialDays.length > 0) {
    const hasAnniversarySub = SubscribeLog.hasSubscribed(
      user.openid,
      config.templates.anniversary
    );
    if (hasAnniversarySub) {
      const labels = specialDays.map(s => s.label).join(' & ');
      templateData = {
        thing1: { value: `${user.partner1_name} ❤️ ${user.partner2_name}` },
        thing2: { value: labels },
        number3: { value: `${loveDays}天` },
        thing4: { value: greeting.substring(0, 20) },
      };
      await sendSubscribeMessage(
        user.openid,
        config.templates.anniversary,
        templateData,
        'pages/index/index'
      );
      console.log(`已发送纪念日推送给 ${user.openid}: ${labels}`);
      return;
    }
  }

  await sendSubscribeMessage(
    user.openid,
    config.templates.dailyGreeting,
    templateData,
    'pages/index/index'
  );
  console.log(`已发送每日推送给 ${user.openid}: 第${loveDays}天`);
}

/**
 * 执行每日推送任务
 */
async function dailyPushTask() {
  console.log('===== 开始每日推送任务 =====');
  try {
    const users = User.getAllActiveUsers();
    console.log(`共 ${users.length} 个活跃用户`);

    for (const user of users) {
      try {
        await sendDailyPush(user);
      } catch (err) {
        console.error(`推送用户 ${user.openid} 失败:`, err.message);
      }
      // 避免过快请求，每个用户间隔 500ms
      await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error('每日推送任务异常:', err);
  }
  console.log('===== 每日推送任务完成 =====');
}

/**
 * 启动定时任务
 */
function startScheduler() {
  const { dailyPushCron } = config;

  console.log(`定时推送任务已启动，cron 表达式: ${dailyPushCron}`);

  // 每日推送
  cron.schedule(dailyPushCron, () => {
    dailyPushTask();
  });

  // 也支持手动触发（调试用）
  // 设置为每分钟：可以在 .env 中设 PUSH_CRON="* * * * *" 进行测试
}

/**
 * 手动触发推送（供测试使用）
 */
async function manualPush() {
  await dailyPushTask();
}

module.exports = { startScheduler, manualPush };
