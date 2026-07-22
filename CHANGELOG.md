# 变更日志

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
