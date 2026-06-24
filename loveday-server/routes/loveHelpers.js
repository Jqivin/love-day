/**
 * 恋爱数据计算辅助函数（供 dashboard 等复用）
 */
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

function calcLoveDays(startDateStr) {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
}

function getDailyGreeting(days) {
  return GREETINGS[days % GREETINGS.length];
}

module.exports = { calcLoveDays, getDailyGreeting, GREETINGS };
