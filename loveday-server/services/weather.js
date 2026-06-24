/**
 * 天气服务 - 使用 Open-Meteo 免费 API（无需 API Key）
 */
const axios = require('axios');

const DEFAULT_CITY = {
  name: '西安',
  latitude: 34.26,
  longitude: 108.94,
};

const WEATHER_CODES = {
  0: '晴',
  1: '晴',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '小雨',
  53: '中雨',
  55: '大雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '阵雨',
  81: '阵雨',
  82: '暴雨',
  95: '雷雨',
};

async function getWeather(lat, lon, cityName) {
  const latitude = lat || DEFAULT_CITY.latitude;
  const longitude = lon || DEFAULT_CITY.longitude;
  const city = cityName || DEFAULT_CITY.name;

  try {
    const url = 'https://api.open-meteo.com/v1/forecast';
    const { data } = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,weather_code',
        timezone: 'Asia/Shanghai',
      },
      timeout: 8000,
    });

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;
    const condition = WEATHER_CODES[code] || '未知';

    return {
      city,
      temperature: temp,
      condition,
      icon: getWeatherIcon(condition),
    };
  } catch (err) {
    console.error('天气获取失败:', err.message);
    return {
      city,
      temperature: '--',
      condition: '暂无数据',
      icon: '🌤️',
    };
  }
}

function getWeatherIcon(condition) {
  if (condition.includes('晴')) return '☀️';
  if (condition.includes('云')) return '⛅';
  if (condition.includes('阴')) return '☁️';
  if (condition.includes('雨')) return '🌧️';
  if (condition.includes('雪')) return '❄️';
  if (condition.includes('雾')) return '🌫️';
  if (condition.includes('雷')) return '⛈️';
  return '🌤️';
}

module.exports = { getWeather, DEFAULT_CITY };
