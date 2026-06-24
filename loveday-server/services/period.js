/**
 * 经期周期计算服务
 */

function parseDate(str) {
  const d = new Date(str + 'T00:00:00');
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function daysBetween(date1Str, date2Str) {
  const d1 = parseDate(date1Str);
  const d2 = parseDate(date2Str);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

const PHASES = [
  { key: 'menstrual', name: '经期' },
  { key: 'follicular', name: '卵泡期' },
  { key: 'ovulation', name: '排卵期' },
  { key: 'luteal', name: '黄体期' },
  { key: 'premenstrual', name: '经前期' },
];

/**
 * 获取当前周期起始日（最近一次经期开始）
 */
function getCurrentCycleStart(lastPeriodStart, cycleLength, today) {
  let start = lastPeriodStart;
  while (daysBetween(start, today) >= cycleLength) {
    start = addDays(start, cycleLength);
  }
  return start;
}

/**
 * 计算当前周期阶段
 */
function calcPhase(cycleDay, cycleLength, periodLength) {
  const ovulationDay = Math.round(cycleLength / 2);
  const premenstrualStart = Math.max(cycleLength - 4, periodLength + 1);

  if (cycleDay <= periodLength) {
    return { key: 'menstrual', name: '经期', label: '经期' };
  }
  if (cycleDay <= ovulationDay - 2) {
    return { key: 'follicular', name: '卵泡期', label: '卵泡期' };
  }
  if (cycleDay <= ovulationDay + 2) {
    return { key: 'ovulation', name: '排卵期', label: '排卵期' };
  }
  if (cycleDay < premenstrualStart) {
    return { key: 'luteal', name: '黄体期', label: '黄体期' };
  }
  return {
    key: 'premenstrual',
    name: '经前期',
    label: '经前期（即将进入经期）',
  };
}

/**
 * 计算经期状态摘要
 */
function calcPeriodStatus(settings, today) {
  const cycleLength = settings.cycle_length || 28;
  const periodLength = settings.period_length || 5;
  const lastPeriodStart = settings.last_period_start;

  if (!lastPeriodStart) {
    return {
      configured: false,
      currentCycleDay: 0,
      averageCycle: cycleLength,
      predictedNextPeriod: null,
      predictedNextPeriodCN: null,
      phase: null,
      phaseName: '未设置',
      phaseLabel: '请先设置经期信息',
      phases: PHASES.map(p => ({ ...p, active: false })),
    };
  }

  const cycleStart = getCurrentCycleStart(lastPeriodStart, cycleLength, today);
  const currentCycleDay = daysBetween(cycleStart, today) + 1;
  const predictedNextPeriod = addDays(cycleStart, cycleLength);
  const phase = calcPhase(currentCycleDay, cycleLength, periodLength);

  const phases = PHASES.map(p => ({
    ...p,
    active: p.key === phase.key,
  }));

  return {
    configured: true,
    currentCycleDay,
    averageCycle: cycleLength,
    periodLength,
    cycleStart,
    predictedNextPeriod,
    predictedNextPeriodCN: formatDateCN(predictedNextPeriod),
    phase: phase.key,
    phaseName: phase.name,
    phaseLabel: phase.label,
    phases,
  };
}

function formatDateCN(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
}

/**
 * 生成某月日历数据
 */
function calcCalendarMonth(settings, year, month, today) {
  const cycleLength = settings.cycle_length || 28;
  const periodLength = settings.period_length || 5;
  const lastPeriodStart = settings.last_period_start;

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const monthStart = formatDate(firstDay);
  const monthEnd = formatDate(lastDay);
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

  const actualPeriodDays = new Set();
  const predictedPeriodDays = new Set();

  if (lastPeriodStart) {
    // 从末次经期向前回退，覆盖日历显示范围
    let periodStart = lastPeriodStart;
    const rangeStart = addDays(monthStart, -cycleLength);
    while (daysBetween(periodStart, rangeStart) > 0) {
      periodStart = addDays(periodStart, -cycleLength);
    }

    const rangeEnd = addDays(monthEnd, cycleLength);
    while (daysBetween(periodStart, rangeEnd) >= 0) {
      for (let i = 0; i < periodLength; i++) {
        const day = addDays(periodStart, i);
        if (day.slice(0, 7) !== monthPrefix) continue;
        if (daysBetween(day, today) >= 0) {
          actualPeriodDays.add(day);
        } else {
          predictedPeriodDays.add(day);
        }
      }
      periodStart = addDays(periodStart, cycleLength);
    }
  }

  const days = [];
  // 上月填充
  const prevMonthLast = new Date(year, month - 1, 0);
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLast.getDate() - i;
    const dateStr = formatDate(new Date(year, month - 2, d));
    days.push(buildDayCell(d, dateStr, today, actualPeriodDays, predictedPeriodDays, false));
  }
  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(new Date(year, month - 1, d));
    days.push(buildDayCell(d, dateStr, today, actualPeriodDays, predictedPeriodDays, true));
  }
  // 下月填充
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = formatDate(new Date(year, month, d));
    days.push(buildDayCell(d, dateStr, today, actualPeriodDays, predictedPeriodDays, false));
  }

  return {
    year,
    month,
    monthLabel: `${year}年${month}月`,
    days,
  };
}

function buildDayCell(dayNum, dateStr, today, actualSet, predictedSet, isCurrentMonth) {
  let type = 'normal';
  if (actualSet.has(dateStr)) type = 'period';
  else if (predictedSet.has(dateStr)) type = 'predicted';
  return {
    day: dayNum,
    date: dateStr,
    isCurrentMonth,
    isToday: dateStr === today,
    type,
  };
}

module.exports = {
  calcPeriodStatus,
  calcCalendarMonth,
  addDays,
  daysBetween,
  formatDate,
  formatDateCN,
  PHASES,
};
