#!/bin/bash

# 工具网站服务器自动部署脚本

echo "======================================"
echo "  工具网站服务器自动部署脚本"
echo "======================================"
echo ""

# 项目目录
PROJECT_DIR="/fwq/sever/tool-website-server"

# 检查目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[ERROR] 项目目录不存在: $PROJECT_DIR"
    echo "请先克隆项目到服务器:"
    echo "git clone https://github.com/brohellow/tool-website-server.git $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

echo "[STEP 1] 拉取最新代码..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "[ERROR] 拉取代码失败"
    exit 1
fi

echo "[STEP 2] 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "[ERROR] 安装依赖失败"
    exit 1
fi

echo "[STEP 3] 构建前端..."
npm run build

if [ $? -ne 0 ]; then
    echo "[ERROR] 构建前端失败"
    exit 1
fi

echo "[STEP 4] 重启服务器..."
pm2 restart tool-website-server

if [ $? -ne 0 ]; then
    echo "[WARNING] PM2重启失败，尝试直接重启..."
    pm2 startOrRestart ecosystem.config.js
fi

echo ""
echo "======================================"
echo "  部署完成！"
echo "======================================"
echo "服务器地址: http://localhost:3001"
echo "三国杀游戏: http://localhost:3001/sanguosha"