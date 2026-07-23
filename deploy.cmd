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

REM ========== 检测 Node.js 路径 ==========
echo [INFO] 检测 Node.js 安装路径...

set "NODE_PATH="

REM 尝试常见的 Node.js 安装路径
if exist "C:\Program Files\nodejs\node.exe" set "NODE_PATH=C:\Program Files\nodejs"
if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE_PATH=C:\Program Files (x86)\nodejs"
if exist "C:\nodejs\node.exe" set "NODE_PATH=C:\nodejs"
if exist "D:\nodejs\node.exe" set "NODE_PATH=D:\nodejs"
if exist "D:\zx\nodejs\node.exe" set "NODE_PATH=D:\zx\nodejs"

REM 尝试从环境变量获取
if not defined NODE_PATH (
    for /f "tokens=*" %%i in ('where node 2^>nul') do (
        set "NODE_PATH=%%~dpi"
        set "NODE_PATH=!NODE_PATH:~0,-1!"
        goto :node_found
    )
)

:node_found

if not defined NODE_PATH (
    echo [ERROR] 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] 找到 Node.js: %NODE_PATH%
set "PATH=%NODE_PATH%;%PATH%"

REM 验证 Node.js 和 npm
echo [INFO] Node.js 版本:
node --version

echo [INFO] npm 版本:
npm --version

echo.

REM ========== 开始部署 ==========

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