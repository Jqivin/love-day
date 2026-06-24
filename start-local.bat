@echo off
chcp 65001 >nul
echo ========================================
echo   恋爱纪念日 - 本地后端启动
echo ========================================
cd /d "%~dp0loveday-server"

if not exist "node_modules" (
  echo [1/3] 安装依赖...
  call npm install
) else (
  echo [1/3] 依赖已存在，跳过安装
)

echo [2/3] 初始化数据库...
call npm run init-db

echo [3/3] 启动服务 http://localhost:3000
echo.
echo 请用微信开发者工具打开 loveday-front 目录
echo 详情 - 本地设置 - 勾选「不校验合法域名」
echo.
call npm start
