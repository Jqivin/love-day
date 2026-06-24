# 本地开发指南

## 一键启动后端

双击运行项目根目录的 `start-local.bat`，或在终端执行：

```bash
cd loveday-server
npm install          # 首次运行
npm run init-db      # 初始化/更新数据库表
npm start            # 启动，默认 http://localhost:3000
```

验证：浏览器打开 http://localhost:3000/api/health ，应返回 `{"status":"ok",...}`

## 打开小程序

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. **导入项目** → 选择 `loveday-front` 目录
3. AppID 选「测试号」或使用你的 AppID
4. **详情 → 本地设置** → 勾选 **「不校验合法域名、web-view、TLS 版本以及 HTTPS 证书」**
5. 点击编译，控制台应显示：`API 地址: http://localhost:3000`

## API 地址说明

`loveday-front/app.js` 已配置为：

| 环境 | API 地址 |
|------|----------|
| 开发版（开发者工具） | `http://localhost:3000` |
| 体验版 / 正式版 | `https://www.jqivin.top` |

## 常见问题

### better-sqlite3 报错

Node 版本变更后需重新编译：

```bash
cd loveday-server
npm install
```

### 端口 3000 被占用

修改 `loveday-server/config/index.js` 中的 `port`，并同步改 `app.js` 里的本地地址。

### 真机预览

手机无法访问电脑的 `localhost`，需改为局域网 IP：

```js
// app.js getApiBaseUrl() 开发版分支中
return 'http://192.168.x.x:3000';  // 替换为你电脑的 IP
```

电脑和手机需在同一 WiFi 下。
