const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
console.log('数据库连接成功');

const initDatabase = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at TEXT NOT NULL
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS tools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        featured INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        parent_id TEXT,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        likes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tool_id) REFERENCES tools(id),
        FOREIGN KEY (parent_id) REFERENCES comments(id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tool_id) REFERENCES tools(id),
        UNIQUE(user_id, tool_id)
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS tool_views (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        tool_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (tool_id) REFERENCES tools(id),
        UNIQUE(user_id, tool_id)
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_tool_views_user_tool ON tool_views(user_id, tool_id)`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS search_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        keyword TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const { count } = db.prepare('SELECT COUNT(*) AS count FROM tools').get();

    if (count === 0) {
      const toolsData = [
        {
          id: 'json-formatter',
          name: 'JSON 格式化工具',
          category: '开发工具',
          description: '格式化和验证 JSON 数据，支持语法高亮显示和错误提示',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
          featured: 1,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'color-picker',
          name: '颜色选择器',
          category: '设计工具',
          description: '从屏幕任意位置拾取颜色值，支持多种颜色格式输出（HEX、RGB、HSL）',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>',
          featured: 1,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'qr-code-generator',
          name: '二维码生成器',
          category: '实用工具',
          description: '为网址、文本、联系方式等生成二维码，支持自定义尺寸和颜色',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="9" y="9" width="6" height="6"/><circle cx="12" cy="12" r="1"/></svg>',
          featured: 1,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'password-generator',
          name: '密码生成器',
          category: '安全工具',
          description: '生成强随机密码，支持自定义长度、字符类型和排除字符',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>',
          featured: 1,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'base64-converter',
          name: 'Base64 编码/解码器',
          category: '开发工具',
          description: '对字符串进行 Base64 编码和解码，支持批量处理和文件转换',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'unit-converter',
          name: '单位转换器',
          category: '实用工具',
          description: '在不同计量单位之间进行转换，包括长度、重量、面积、温度等',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'timestamp-converter',
          name: '时间戳转换器',
          category: '开发工具',
          description: '在时间戳和人类可读时间之间进行转换，支持多种时间格式',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'url-encoder',
          name: 'URL 编码/解码器',
          category: '开发工具',
          description: '对 URL 进行编码和解码，支持中文和特殊字符处理',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'regex-tester',
          name: '正则表达式测试器',
          category: '开发工具',
          description: '测试和验证正则表达式，支持实时匹配和分组显示',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'calculator',
          name: '计算器',
          category: '实用工具',
          description: '基础计算器，支持加减乘除等常用运算',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>',
          featured: 0,
          usage_count: 0,
          views_count: 0,
          created_at: new Date().toISOString()
        }
      ];

      const insertTool = db.prepare(`
        INSERT INTO tools (id, name, category, description, icon, featured, usage_count, views_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertTools = db.transaction((tools) => {
        for (const tool of tools) {
          insertTool.run(tool.id, tool.name, tool.category, tool.description, tool.icon, tool.featured, tool.usage_count, tool.views_count, tool.created_at);
        }
      });

      insertTools(toolsData);
      console.log('初始工具数据已插入');

      const bcrypt = require('bcryptjs');

      const usersData = [
        { id: 'user-1', email: 'admin@toolbox.com', password: bcrypt.hashSync('123456', 10), username: '管理员', avatar_url: null, bio: '工具网站管理员，喜欢开发各种实用工具', created_at: new Date().toISOString() },
        { id: 'user-2', email: 'test@example.com', password: bcrypt.hashSync('123456', 10), username: '测试用户', avatar_url: null, bio: '普通用户，喜欢使用各种在线工具', created_at: new Date().toISOString() },
        { id: 'user-3', email: 'developer@code.com', password: bcrypt.hashSync('123456', 10), username: '开发者', avatar_url: null, bio: '全栈开发者，热爱编程和技术分享', created_at: new Date().toISOString() },
      ];

      const insertUser = db.prepare(`
        INSERT INTO users (id, email, password, username, avatar_url, bio, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertUsers = db.transaction((users) => {
        for (const user of users) {
          insertUser.run(user.id, user.email, user.password, user.username, user.avatar_url, user.bio, user.created_at);
        }
      });

      insertUsers(usersData);
      console.log('初始用户数据已插入');

      const commentsData = [
        { id: 'comment-1', user_id: 'user-1', tool_id: 'json-formatter', parent_id: null, content: '非常好用的JSON格式化工具，帮我解决了很多调试问题！', rating: 5, likes: 2, created_at: new Date().toISOString() },
        { id: 'comment-2', user_id: 'user-2', tool_id: 'json-formatter', parent_id: 'comment-1', content: '同感！我也是经常用这个工具调试接口', rating: 0, likes: 1, created_at: new Date().toISOString() },
        { id: 'comment-3', user_id: 'user-3', tool_id: 'json-formatter', parent_id: null, content: '界面简洁，功能强大，强烈推荐！', rating: 5, likes: 3, created_at: new Date().toISOString() },
        { id: 'comment-4', user_id: 'user-1', tool_id: 'password-generator', parent_id: null, content: '密码生成器很实用，可以自定义各种参数。', rating: 4, likes: 1, created_at: new Date().toISOString() },
        { id: 'comment-5', user_id: 'user-2', tool_id: 'qr-code-generator', parent_id: null, content: '二维码生成速度很快，支持自定义颜色很棒！', rating: 5, likes: 4, created_at: new Date().toISOString() },
        { id: 'comment-6', user_id: 'user-3', tool_id: 'color-picker', parent_id: null, content: '颜色选择器很好用，HEX/RGB/HSL转换很方便。', rating: 4, likes: 2, created_at: new Date().toISOString() },
      ];

      const insertComment = db.prepare(`
        INSERT INTO comments (id, user_id, tool_id, parent_id, content, rating, likes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertComments = db.transaction((comments) => {
        for (const comment of comments) {
          insertComment.run(comment.id, comment.user_id, comment.tool_id, comment.parent_id, comment.content, comment.rating, comment.likes, comment.created_at);
        }
      });

      insertComments(commentsData);
      console.log('初始评论数据已插入');
    } else {
      console.log('数据库已存在数据');
    }
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
  }
};

const closeDatabase = () => {
  db.close();
};

module.exports = {
  db,
  initDatabase,
  closeDatabase
};
