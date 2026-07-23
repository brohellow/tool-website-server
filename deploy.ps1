param(
    [string]$ProjectDir = "C:\fwq\sever\tool-website-server"
)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  工具网站服务器自动部署脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $ProjectDir)) {
    Write-Host "[ERROR] 项目目录不存在: $ProjectDir" -ForegroundColor Red
    Write-Host "请先克隆项目到服务器:" -ForegroundColor Yellow
    Write-Host "git clone https://github.com/brohellow/tool-website-server.git $ProjectDir" -ForegroundColor Yellow
    exit 1
}

Set-Location $ProjectDir

Write-Host "[STEP 1] 拉取最新代码..." -ForegroundColor Green
git pull origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 拉取代码失败" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 2] 安装依赖..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 安装依赖失败" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 3] 构建前端..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 构建前端失败" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 4] 重启服务器..." -ForegroundColor Green
try {
    pm2 restart tool-website-server
} catch {
    Write-Host "[WARNING] PM2重启失败，尝试直接重启..." -ForegroundColor Yellow
    try {
        pm2 startOrRestart ecosystem.config.js
    } catch {
        Write-Host "[ERROR] 重启服务器失败，请手动重启" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  部署完成！" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "服务器地址: http://localhost:3001" -ForegroundColor Green
Write-Host "三国杀游戏: http://localhost:3001/sanguosha" -ForegroundColor Green