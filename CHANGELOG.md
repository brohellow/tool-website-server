# 变更日志

## 2026-07-23

### 🔒 后端安全优化

- 添加 **helmet** 中间件，增强安全防护（CSP、XSS、点击劫持等）
- 添加 **express-rate-limit** 速率限制：API 接口 15 分钟 100 次，认证接口 15 分钟 10 次
- 添加 **express-validator** 输入校验支持
- 配置严格的 **CORS** 策略，限制允许的来源
- 修复静态资源托管安全漏洞（禁止访问隐藏文件、禁止目录索引）

### ⚡ 后端性能优化

- 添加 **compression** 中间件，启用 Gzip 压缩
- 配置静态资源缓存策略（maxAge: 1d，支持 ETag）
- 优化日志系统，支持多级别日志（info/error）和元数据记录

### 💾 数据持久化优化

- 实现**原子写入**：先写入临时文件再重命名，防止数据损坏
- 添加**并发写入队列**，避免同时写入冲突
- 添加数据恢复机制：启动时检查临时文件并自动恢复
- 完善优雅关闭处理：捕获 SIGINT/SIGTERM/uncaughtException 信号确保数据保存

### 🎨 前端性能优化

- 实现**路由懒加载**：使用 React.lazy 和 Suspense 分割代码
- 添加**页面加载骨架屏**，提升用户体验
- 代码自动分割打包，减少首屏加载体积

### ✨ 前端功能增强

- 添加**通知系统**：支持 success/error/warning/info 四种类型，自动消失
- 添加**搜索历史**：记录最近 10 次搜索，支持快速复用和清空
- **主题切换**已完善，支持 localStorage 持久化

### 📝 文档更新

- 更新 DEPLOYMENT.md，添加安全和性能配置说明

### 📁 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `backend/server.js` | 修改 | 添加 helmet、rate-limit、compression、统一错误处理 |
| `backend/memoryDb.js` | 修改 | 原子写入、并发队列、数据恢复 |
| `src/App.tsx` | 修改 | 路由懒加载、Loading 组件、Notification 组件 |
| `src/store/useStore.ts` | 修改 | 添加通知系统、搜索历史 |
| `src/components/Notification.tsx` | 新建 | 通知组件 |
| `src/pages/Home.tsx` | 修改 | 添加搜索历史功能 |
| `src/index.css` | 修改 | 添加通知动画样式 |

### ✅ 验证结果

- ✅ 前端构建成功
- ✅ 代码分割有效（15 个独立 chunk）
- ✅ 安全中间件配置正确

## 2026-07-22

### 🛠️ 功能增强

#### 1. 工具数量扩展
- 在 `backend/memoryDb.js` 中新增 **20+ 个工具**
- 新增类别：Markdown编辑器、图片压缩器、二维码生成器、天气查询、汇率换算、IP查询、时间转换、随机数生成等
- 工具总数达到 30+ 个

#### 2. 三国杀选武将功能
- 在 `backend/gameEngine.js` 中添加 **20名武将数据**（刘备、关羽、张飞、赵云、马超、黄忠、诸葛亮、周瑜、孙权、曹操等）
- 每名武将拥有独特技能和血量
- 添加 `selecting_warrior` 游戏阶段，在游戏开始前先进行选将
- 在 `backend/server.js` 中添加 `select-warrior` Socket 事件处理
- 在 `src/pages/GameRoom.tsx` 中添加完整的选将界面：
  - 玩家列表显示选将状态
  - 武将卡片展示（头像、技能名称、技能描述、血量）
  - 点击选择武将后显示已选状态
  - 等待其他玩家选择的提示
- 游戏界面中显示玩家选择的武将信息和技能

### 🐛 Bug 修复

#### 三国杀模块显示问题
- 在 `src/pages/GameRoom.tsx` 中添加**连接状态提示和错误处理**
- 连接中显示加载动画
- 连接失败显示错误信息和重新连接按钮
- 修复 TypeScript 类型错误（publicState 空值检查）

### 📝 文档整理

#### 文档结构优化
- 更新 `DEPLOYMENT.md`：
  - 新增项目概述章节（目的、目标用户、访问地址）
  - 新增核心功能章节（用户角色、功能模块、页面路由）
  - 更新项目结构（添加 store/ 和 tools/ 目录）
- 删除过时文件：
  - `.trae/documents/technical-architecture.md`（描述 Supabase 架构，与实际不符）
  - `.trae/documents/prd.md`（内容已合并）
- 新建 `README.md`：
  - 项目简要介绍
  - 功能特色
  - 技术栈
  - 开发部署指引

### 📁 文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `backend/memoryDb.js` | 修改 | 添加20+工具数据 |
| `backend/gameEngine.js` | 修改 | 添加武将数据和选将逻辑 |
| `backend/server.js` | 修改 | 添加 select-warrior Socket 事件 |
| `src/pages/GameRoom.tsx` | 修改 | 添加选将界面和连接状态处理 |
| `DEPLOYMENT.md` | 修改 | 更新项目概述和功能说明 |
| `README.md` | 新建 | 项目简介文档 |
| `.trae/documents/technical-architecture.md` | 删除 | 过时文档 |
| `.trae/documents/prd.md` | 删除 | 过时文档 |

### ✅ 验证结果

- ✅ 前端构建成功（`npm run build`）
- ✅ 开发服务器启动正常
- ✅ 选将流程完整可用
- ✅ 工具列表扩展完成
