# 部署指南

## 一、后端部署到云服务器

### 1. 准备服务器

推荐方案（按性价比排序）：

| 方案 | 价格 | 适合 |
|------|------|------|
| 阿里云/腾讯云轻量应用服务器 | ¥68/年起 | 个人项目首选 |
| 腾讯云 CloudBase 云托管 | 按量付费 | 免运维 |

服务器配置：Linux (CentOS 7+ / Ubuntu 20.04+)，1核2G 足够。

### 2. 上传后端代码

```bash
# 在服务器上
mkdir -p /opt/love-days
cd /opt/love-days

# 从本地上传（在本地执行）
scp -r backend/* root@你的服务器IP:/opt/love-days/
```

### 3. 安装 Node.js 和依赖

```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装依赖
cd /opt/love-days
npm install

# 初始化数据库
npm run init-db
```

### 4. 配置环境变量

```bash
# 编辑配置文件
vi /opt/love-days/config/index.js
```

修改以下内容：
```js
port: 3000,
wechat: {
  appId: 'wx244282d0a4f81078',   // 你的小程序AppID
  appSecret: '你的AppSecret',      // 小程序AppSecret
},
templates: {
  dailyGreeting: '实际的每日模板ID',
  anniversary: '实际的纪念日模板ID',
},
```

### 5. 使用 PM2 守护进程

```bash
npm install -g pm2
pm2 start app.js --name love-days
pm2 save
pm2 startup    # 设置开机自启
```

### 6. 配置 Nginx 反向代理 + HTTPS

微信小程序要求后端必须使用 HTTPS 域名。

```bash
# 安装 Nginx
sudo apt-get install -y nginx

# 创建配置
sudo vi /etc/nginx/conf.d/love-days.conf
```

Nginx 配置：
```nginx
server {
    listen 443 ssl;
    server_name api.你的域名.com;

    ssl_certificate     /etc/ssl/你的证书.crt;
    ssl_certificate_key /etc/ssl/你的证书.key;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

免费 HTTPS 证书（Let's Encrypt）：
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.你的域名.com
```

---

## 二、小程序端部署

### 1. 更新 API 地址

修改 `miniprogram/app.js` 中的 `apiBaseUrl`：
```js
globalData: {
  apiBaseUrl: 'https://api.你的域名.com',  // 改为生产环境地址
}
```

### 2. 配置服务器域名白名单

登录 [微信公众平台](https://mp.weixin.qq.com) → 开发管理 → 开发设置 → 服务器域名：

| 类型 | 域名 |
|------|------|
| request 合法域名 | `https://api.你的域名.com` |

### 3. 上传小程序

微信开发者工具 → 右上角「上传」→ 填写版本号（如 1.0.0）→ 上传。

### 4. 提交审核

微信公众平台 → 版本管理 → 选择刚上传的版本 → 提交审核 → 填写审核信息 → 提交。

审核通过后点击「发布」即可上线。

---

## 三、本地 vs 生产切换

建议在 `app.js` 中根据环境自动切换：

```js
// 开发环境
apiBaseUrl: 'http://localhost:3000',

// 生产环境（上传前手动修改）
// apiBaseUrl: 'https://api.你的域名.com',
```

---

## 快速部署检查清单

- [ ] 服务器购买并配置好
- [ ] Node.js 18+ 已安装
- [ ] 后端代码已上传
- [ ] `npm install` 依赖安装成功
- [ ] 数据库已初始化 `npm run init-db`
- [ ] PM2 已启动后端服务
- [ ] Nginx 已配置 HTTPS 反向代理
- [ ] 域名 DNS 已解析到服务器 IP
- [ ] SSL 证书已配置
- [ ] 微信公众平台 server 域名已添加
- [ ] 小程序 `apiBaseUrl` 已改为生产地址
- [ ] 订阅消息模板已申请
- [ ] 配置文件中的 AppID/Secret/模板ID 已更新
- [ ] 小程序已上传并提交审核
