/**
 * 微信 API 服务
 * 负责获取 access_token 和发送订阅消息
 */
const axios = require('axios');
const config = require('../config');

let accessToken = null;
let tokenExpireTime = 0;

/**
 * 获取微信 access_token（带缓存）
 */
async function getAccessToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpireTime - 300000) {
    // 提前 5 分钟刷新，避免过期
    return accessToken;
  }

  try {
    const { appId, appSecret } = config.wechat;
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    const res = await axios.get(url);

    if (res.data.access_token) {
      accessToken = res.data.access_token;
      tokenExpireTime = now + (res.data.expires_in || 7200) * 1000;
      console.log('access_token 已刷新');
      return accessToken;
    } else {
      console.error('获取 access_token 失败:', res.data);
      throw new Error(res.data.errmsg || '获取 access_token 失败');
    }
  } catch (err) {
    console.error('请求 access_token 异常:', err.message);
    throw err;
  }
}

/**
 * 发送订阅消息
 * @param {string} openid - 接收者 openid
 * @param {string} templateId - 模板ID
 * @param {object} data - 模板数据
 * @param {string} page - 点击跳转的小程序页面（可选）
 */
async function sendSubscribeMessage(openid, templateId, data, page) {
  try {
    const token = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`;

    const body = {
      touser: openid,
      template_id: templateId,
      data,
    };

    if (page) {
      body.page = page;
    }

    const res = await axios.post(url, body);
    return res.data;
  } catch (err) {
    console.error('发送订阅消息异常:', err.message);
    throw err;
  }
}

/**
 * 通过 login code 换取 openid 和 session_key
 * @param {string} code - 前端 wx.login() 获取的临时凭证
 * @returns {{ openid: string, session_key: string }}
 */
async function code2Session(code) {
  try {
    const { appId, appSecret } = config.wechat;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const res = await axios.get(url);

    if (res.data.openid) {
      console.log('code2Session 成功, openid:', res.data.openid.substring(0, 8) + '***');
      return { openid: res.data.openid, session_key: res.data.session_key };
    } else {
      console.error('code2Session 失败:', res.data);
      throw new Error(res.data.errmsg || '微信登录失败');
    }
  } catch (err) {
    console.error('code2Session 异常:', err.message);
    throw err;
  }
}

module.exports = { getAccessToken, sendSubscribeMessage, code2Session };
