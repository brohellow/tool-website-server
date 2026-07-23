@echo off
chcp 65001 >nul
title 工具网站服务器自动部署

echo ======================================
echo   工具网站服务器自动部署脚本
echo ======================================
echo.

set "ProjectDir=C:\fwq\sever\tool-website-server"

if not exist "%ProjectDir%" (
    echo [ERROR] 项目目录不存在: %ProjectDir%
    echo 请先克隆项目到服务器:
    echo git clone https://github.com/brohellow/tool-website-server.git %ProjectDir%
    pause
    exit /b 1
)

cd /d "%ProjectDir%"

echo [STEP 1] 拉取最新代码...
git pull origin main

if %errorlevel% neq 0 (
    echo [ERROR] 拉取代码失败
    pause
    exit /b 1
)

echo [STEP 2] 安装依赖...
npm install

if %errorlevel% neq 0 (
    echo [ERROR] 安装依赖失败
    pause
    exit /b 1
)

echo [STEP 3] 构建前端...
npm run build

if %errorlevel% neq 0 (
    echo [ERROR] 构建前端失败
    pause
    exit /b 1
)

echo [STEP 4] 构建无名杀游戏...
cd /d "%ProjectDir%\noname"

REM 检查pnpm是否可用
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] 安装pnpm...
    npm install -g pnpm
)

REM 安装无名杀依赖（如果node_modules不存在）
if not exist "node_modules" (
    echo [INFO] 安装无名杀依赖...
    pnpm install
)

REM 构建无名杀
pnpm build

if %errorlevel% neq 0 (
    echo [ERROR] 构建无名杀失败
    pause
    exit /b 1
)

cd /d "%ProjectDir%"

echo [STEP 5] 重启服务器...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

start /b node backend\server.js

echo.
echo ======================================
echo   部署完成！
echo ======================================
echo 服务器地址: http://localhost:3001
echo 三国杀游戏: http://localhost:3001/sanguosha
echo.
pause