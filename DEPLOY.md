# 工具网站部署指南

## 项目概述

本项目是一个工具类网站，包含前端（React + TypeScript + Vite）和后端（Express + SQLite）。

## 部署方式

### 方式一：部署到云服务器（推荐）

#### 1. 准备服务器
- 购买一台云服务器（如阿里云、腾讯云、华为云等）
- 推荐配置：2核4G内存，Ubuntu 22.04 或 CentOS 7+

#### 2. 安装 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 3. 上传项目文件
```bash
# 使用 scp 上传
scp -r ./tool-website root@your-server-ip:/opt/

# 或者使用 git clone（如果项目已上传到 GitHub）
git clone https://github.com/your-username/tool-website.git
```

#### 4. 安装依赖并构建
```bash
cd /opt/tool-website
npm install
npm run build
cd backend && npm install
```

#### 5. 设置环境变量
```bash
# 创建 .env 文件
cat > .env << EOF
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-here-change-in-production
EOF
```

#### 6. 使用 PM2 启动服务
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start backend/server.js --name tool-website --env production

# 保存配置，开机自启
pm2 save
pm2 startup
```

#### 7. 配置 Nginx（可选但推荐）
```bash
# 安装 Nginx
sudo apt-get install nginx

# 配置反向代理
cat > /etc/nginx/sites-available/tool-website << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/tool-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. 配置 HTTPS（可选但推荐）
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

### 方式二：部署到 Railway（免费/低成本）

1. 访问 https://railway.app 并注册账号
2. 创建新项目，选择 "Deploy from GitHub repo"
3. 选择你的 GitHub 仓库
4. 配置环境变量：
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `JWT_SECRET`: 你的密钥
5. 设置构建命令：`npm run build`
6. 设置启动命令：`node backend/server.js`
7. 部署完成后获取域名

---

### 方式三：部署到 Render（免费/低成本）

1. 访问 https://render.com 并注册账号
2. 创建新的 Web Service
3. 连接你的 GitHub 仓库
4. 配置：
   - **Build Command**: `npm run build`
   - **Start Command**: `node backend/server.js`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `3001`
     - `JWT_SECRET`: 你的密钥
5. 部署完成后获取域名

---

### 方式四：部署到 Vercel（前端）+ 其他平台（后端）

1. **前端部署到 Vercel**：
   - 访问 https://vercel.com 并注册
   - 导入项目，配置构建命令为 `npm run build`
   - 在 Vercel 环境变量中设置 `VITE_API_URL` 为后端 API 地址

2. **后端部署到其他平台**：
   - 使用上述任意方式部署后端
   - 确保后端配置了 CORS，允许 Vercel 域名访问

---

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3001` |
| `JWT_SECRET` | JWT 密钥 | `your-secret-key-here-change-in-production` |
| `VITE_API_URL` | 前端 API 地址 | ``（空字符串，使用相对路径） |

## 目录结构

```
tool-website/
├── backend/          # 后端代码
│   ├── server.js     # Express 服务器入口
│   ├── database.js   # SQLite 数据库配置
│   └── package.json  # 后端依赖
├── src/              # 前端源代码
├── dist/             # 前端构建产物（部署时自动生成）
├── package.json      # 前端依赖和脚本
└── DEPLOY.md         # 本部署文档
```

## 常用命令

```bash
# 开发模式
npm run dev          # 启动前端开发服务器
cd backend && npm start  # 启动后端服务器

# 生产构建
npm run build        # 构建前端
npm run build:prod   # 构建前端并安装后端依赖

# 生产启动
npm run start:prod   # 启动生产环境服务器

# PM2 管理
pm2 list             # 查看进程列表
pm2 restart tool-website  # 重启服务
pm2 logs tool-website     # 查看日志
pm2 stop tool-website     # 停止服务
```

## 注意事项

1. **数据库持久化**：SQLite 是文件数据库，部署时确保 `backend/database.sqlite` 文件所在目录有写入权限
2. **安全**：生产环境务必修改 `JWT_SECRET` 为复杂的随机字符串
3. **备份**：定期备份数据库文件
4. **性能**：对于高流量场景，建议使用 PostgreSQL 替代 SQLite
5. **HTTPS**：生产环境建议配置 HTTPS，避免浏览器安全限制

## 故障排查

### 服务无法启动
```bash
# 查看日志
pm2 logs tool-website

# 检查端口占用
netstat -tlnp | grep 3001

# 检查 Node.js 版本
node -v
```

### 前端无法访问后端 API
```bash
# 检查 CORS 配置
curl -I http://localhost:3001/api/tools

# 检查防火墙
sudo ufw status
sudo ufw allow 3001
```

### 数据库连接失败
```bash
# 检查数据库文件权限
ls -la backend/database.sqlite

# 检查目录权限
ls -la backend/
```