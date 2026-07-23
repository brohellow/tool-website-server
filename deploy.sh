#!/bin/bash

echo "======================================"
echo "  工具网站部署脚本"
echo "======================================"

# 拉取最新代码
echo ""
echo "[1/5] 拉取最新代码..."
git pull origin main

# 安装依赖
echo ""
echo "[2/5] 安装依赖..."
npm install --production

# 构建前端
echo ""
echo "[3/5] 构建前端..."
npm run build

# 检查并克隆无名杀项目
echo ""
echo "[4/5] 检查无名杀项目..."
if [ ! -d "noname/apps/core" ]; then
  echo "克隆无名杀项目..."
  git clone https://github.com/libnoname/noname.git
else
  echo "无名杀项目已存在，跳过克隆"
fi

# 重启服务（使用PM2）
echo ""
echo "[5/5] 重启服务..."
if command -v pm2 &> /dev/null; then
  pm2 restart tool-website-server 2>/dev/null || pm2 start backend/server.js --name tool-website-server
else
  echo "PM2 未安装，请手动重启服务"
  echo "执行: node backend/server.js"
fi

echo ""
echo "======================================"
echo "  部署完成！"
echo "======================================"