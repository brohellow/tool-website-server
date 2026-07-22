# 工具乐园 - 多功能在线工具平台

## 项目概述

一个创意个性的多功能工具集合网站，汇集多种实用在线工具，为用户提供便捷高效的在线服务体验。

**主要目的**：提供各类实用工具，解决用户日常工作和生活中的小问题  
**目标用户**：需要在线工具的普通用户、开发者、设计师等  
**市场价值**：一站式工具平台，减少用户寻找工具的时间成本  
**访问地址**：http://20111108.xyz

## 核心功能

### 用户角色
| 角色 | 注册方式 | 核心权限 |
|------|----------|----------|
| 普通用户 | 邮箱注册 | 使用工具、收藏、评论 |
| 管理员 | 系统邀请 | 管理工具、审核评论 |

### 功能模块
1. **首页**：工具分类、精选工具、搜索功能
2. **工具页面**：工具交互界面、使用历史、分享选项
3. **个人中心**：用户信息、收藏工具、使用历史、设置
4. **聊天室**：实时聊天功能
5. **三国杀游戏**：多人在线卡牌游戏

### 页面路由
| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| `/` | 首页 | 展示工具分类和精选工具 |
| `/tools/:category` | 工具分类页 | 展示某分类下的所有工具 |
| `/tool/:id` | 工具详情页 | 工具交互界面 |
| `/profile` | 个人中心 | 用户信息和设置 |
| `/chat` | 聊天室 | 实时聊天 |
| `/game` | 游戏大厅 | 三国杀游戏入口 |
| `/game/room/:roomId` | 游戏房间 | 三国杀对战房间 |
| `/login` | 登录页 | 用户登录 |
| `/register` | 注册页 | 用户注册 |

## 项目结构

```
tool-website-server/
├── src/                    # 前端源代码 (TypeScript + React)
│   ├── components/         # 组件
│   ├── pages/              # 页面
│   ├── utils/              # 工具函数
│   ├── types/              # 类型定义
│   ├── store/              # Zustand 状态管理
│   ├── tools/              # 工具功能实现
│   └── main.tsx            # 入口文件
├── backend/                # 后端源代码 (Node.js + Express)
│   ├── server.js           # 服务器主文件
│   ├── memoryDb.js         # 内存数据库实现
│   ├── gameEngine.js       # 游戏引擎
│   └── package.json        # 后端依赖
├── dist/                   # 前端构建产物 (已提交到 GitHub)
├── package.json            # 前端依赖和脚本
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # TailwindCSS 配置
├── postcss.config.js       # PostCSS 配置
└── .gitignore              # Git 忽略文件
```

## 本地开发

### 启动后端

```bash
node backend/server.js
```

后端运行在: http://localhost:3001

### 启动前端

```bash
npm run dev
```

前端运行在: http://localhost:5173

### 本地测试 API

```bash
# 获取工具列表
curl http://localhost:3001/api/tools

# 获取分类列表
curl http://localhost:3001/api/categories

# 健康检查
curl http://localhost:3001/healthz
```

## 部署流程

### 步骤 1: 修改代码

根据修改类型执行不同操作：

| 修改类型 | 是否需要构建 | 说明 |
|----------|--------------|------|
| 前端代码 (`src/`) | ✅ 需要 | TypeScript 需编译为 JavaScript |
| 后端代码 (`backend/`) | ❌ 不需要 | Node.js 直接运行 |
| 配置文件 | ❌ 不需要 | 如 vite.config.ts、tsconfig.json |

### 步骤 2: 构建前端（如修改了前端代码）

```bash
npm run build
```

构建成功后会更新 `dist/` 文件夹。

### 步骤 3: 提交到 GitHub

```bash
# 查看修改
git status

# 添加所有文件
git add -A

# 提交（描述清楚修改内容）
git commit -m "描述你的修改"

# 推送到远程仓库
git push
```

### 步骤 4: 同步到服务器

在**工具乐园同步管理器**中：
1. 点击**清空日志**（可选）
2. 点击**开始同步**
3. 等待同步完成（包含 Git Pull → npm install → Build → Restart）

同步管理器日志中应显示以下步骤：
- ✅ Git Pull 成功
- ✅ Backend Dep (npm install) 成功
- ✅ Root Dep (npm install) 成功  
- ✅ Build (npm run build) 成功
- ✅ Restart 成功

## 常见问题排查

### 问题 1: 页面一直加载/显示"加载失败"

**原因**: API 请求失败或返回错误数据

**排查步骤**:
1. 打开浏览器开发者工具（F12）
2. 查看"控制台"是否有错误信息
3. 查看"网络"标签，检查 `/api/tools` 请求状态
4. 在地址栏直接访问 `http://20111108.xyz/api/tools` 确认 API 是否正常

**常见原因**:
- 服务器未启动 → 在同步管理器中启动服务
- API 地址错误 → 检查 `src/utils/api.ts` 中的 `API_BASE_URL`
- 前端代码未更新 → 确保已执行 `npm run build` 并提交

### 问题 2: 同步管理器显示"正在启动..."但一直不完成

**原因**: 某一步骤卡住或失败

**排查步骤**:
1. 查看同步管理器日志
2. 检查是否有错误信息
3. 手动重启同步管理器

### 问题 3: 页面样式错乱

**原因**: 前端构建产物未更新

**解决方案**:
1. 重新执行 `npm run build`
2. 提交并推送到 GitHub
3. 在同步管理器中点击"重新同步"

### 问题 4: 数据库数据丢失

**原因**: 内存数据库在服务器重启时会清空数据

**解决方案**:
- `backend/memoryDb.js` 中的 `initDatabase()` 函数会在服务启动时自动初始化示例数据
- 如需持久化存储，需修改为文件存储或使用 SQLite

## API 接口说明

### 工具相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tools` | GET | 获取所有工具 |
| `/api/tools/:id` | GET | 获取工具详情 |
| `/api/tools/featured` | GET | 获取精选工具 |
| `/api/tools/category/:category` | GET | 获取分类工具 |
| `/api/tools/search?query=xxx` | GET | 搜索工具 |
| `/api/tools/:id/usage` | PUT | 增加使用次数 |
| `/api/tools/:id/views` | PUT | 增加浏览量 |

### 分类相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取所有分类 |

### 用户认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/user` | GET | 获取当前用户（需认证） |

### 评论相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/comments/:toolId` | GET | 获取工具评论 |
| `/api/comments` | GET | 获取所有评论 |
| `/api/comments` | POST | 添加评论（需认证） |
| `/api/comments/:id/likes` | PUT | 点赞评论（需认证） |

### 收藏相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/favorites/:userId` | GET | 获取用户收藏（需认证） |
| `/api/favorites` | POST | 添加收藏（需认证） |
| `/api/favorites/:toolId` | DELETE | 删除收藏（需认证） |
| `/api/favorites/check/:userId/:toolId` | GET | 检查是否收藏（需认证） |

### 健康检查

| 接口 | 方法 | 说明 |
|------|------|------|
| `/healthz` | GET | 健康检查 |
| `/api/version` | GET | 版本信息 |

## 技术栈

### 前端

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **状态管理**: Zustand
- **图标**: Lucide React
- **HTTP 请求**: Fetch API

### 后端

- **框架**: Express 4
- **数据库**: memoryDb (内存数据库，用于 Node v24 兼容性)
- **认证**: JWT + bcryptjs
- **实时通信**: Socket.IO
- **游戏引擎**: 自定义三国杀游戏引擎

## 环境变量

后端支持以下环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3001 | 服务器端口 |
| `JWT_SECRET` | your-secret-key-here | JWT 密钥 |
| `NODE_ENV` | - | 环境模式 (production/development) |

## 开发注意事项

1. **API 地址**: 前端使用相对路径 `/api`，不要硬编码域名
2. **构建产物**: `dist/` 已提交到 GitHub，修改前端代码后必须执行 `npm run build`
3. **数据库**: 内存数据库在服务器重启时会重置，重要数据需持久化
4. **部署**: 修改代码后必须推送到 GitHub，然后在同步管理器中点击"开始同步"
5. **错误处理**: 所有 API 接口都有错误处理，前端需捕获并显示错误信息

## 服务器信息

- **域名**: http://20111108.xyz
- **后端端口**: 3001
- **前端端口**: 通过 Cloudflare Tunnel 访问
- **GitHub 仓库**: https://github.com/brohellow/tool-website-server