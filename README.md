# 💕 恋爱纪念日微信小程序

一个温馨的微信小程序，帮你记录恋爱天数，推送纪念日提醒和每日问候。

## 功能特性

- 📊 **恋爱天数** — 首页实时显示从恋爱开始到今天的天数
- 💌 **每日情话** — 根据恋爱天数自动匹配一句温暖问候
- 📅 **纪念日列表** — 展示整百天、周年、月度等各类纪念日
- 🔔 **微信推送** — 每天上午 9:00 订阅消息提醒（支持每日问候 + 纪念日特别祝福）
- ⚙️ **个性化设置** — 设置恋爱开始日期、双方昵称

## 项目结构

```
├── miniprogram/           # 微信小程序前端
│   ├── pages/
│   │   ├── index/         # 首页（天数 + 问候）
│   │   ├── settings/      # 设置页
│   │   ├── anniversaries/ # 纪念日列表
│   │   └── subscribe/     # 订阅消息授权
│   └── utils/             # 工具函数
├── backend/               # Node.js 后端服务
│   ├── routes/            # API 路由
│   ├── models/            # 数据模型
│   ├── services/          # 微信服务 + 定时调度
│   └── database/          # SQLite 数据库
└── README.md
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 启动服务（默认端口 3000）
npm start
```

启动后访问 http://localhost:3000/api/health 确认服务正常运行。

### 2. 打开小程序

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 用微信开发者工具打开 `miniprogram/` 目录
3. 选择「测试号」即可预览（无需 AppID）
4. 将 `app.js` 中的 `apiBaseUrl` 改为你的后端地址

### 3. 配置微信推送（需正式 AppID）

1. 在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序，获取 AppID 和 AppSecret
2. 在「订阅消息」中申请模板，获取模板 ID
3. 修改 `backend/config/index.js` 中的微信配置：
   - `wechat.appId` / `wechat.appSecret`
   - `templates.dailyGreeting` / `templates.anniversary`
4. 修改 `miniprogram/pages/subscribe/subscribe.js` 中的 `templateIds`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/user/login` | 用户登录 |
| PUT  | `/api/user/settings` | 更新恋爱设置 |
| GET  | `/api/user/info` | 获取用户信息 |
| GET  | `/api/love/info` | 获取恋爱信息（天数、纪念日、问候） |
| POST | `/api/subscribe/record` | 记录订阅消息授权 |
| GET  | `/api/subscribe/status` | 查询订阅状态 |
| GET  | `/api/health` | 健康检查 |
| POST | `/api/admin/push` | 手动触发推送（调试） |

## 定时推送说明

- **每日推送**：每天早上 9:00，推送恋爱天数和问候语
- **整百天纪念日**：恋爱 100天/200天/300天... 时特别推送
- **周年纪念日**：每年恋爱开始日推送周年祝福
- **月度纪念日**：每月同一天推送月度祝福

推送通过微信「订阅消息」实现，用户需先在小程序内点击授权。

## 技术栈

- **前端**：微信原生小程序（WXML + WXSS + JS）
- **后端**：Node.js + Express
- **数据库**：SQLite（better-sqlite3）
- **定时任务**：node-cron
- **微信接口**：axios

## 调试技巧

- 将 `backend/.env` 的 `PUSH_CRON` 设为 `* * * * *` 可每分钟触发推送（调试用）
- 小程序订阅页长按标题 3 次可开启调试工具
- 后端 `POST /api/admin/push` 可手动触发一次推送任务
