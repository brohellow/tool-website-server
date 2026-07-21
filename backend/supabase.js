const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const initDatabase = async () => {
  const { data: tables } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  const tableNames = tables ? tables.map(t => t.table_name) : [];

  if (!tableNames.includes('users')) {
    await supabase.rpc('create_users_table');
  }

  if (!tableNames.includes('tools')) {
    await supabase.rpc('create_tools_table');
  }

  if (!tableNames.includes('comments')) {
    await supabase.rpc('create_comments_table');
  }

  if (!tableNames.includes('favorites')) {
    await supabase.rpc('create_favorites_table');
  }

  if (!tableNames.includes('tool_views')) {
    await supabase.rpc('create_tool_views_table');
  }

  if (!tableNames.includes('search_history')) {
    await supabase.rpc('create_search_history_table');
  }

  const { data: tools } = await supabase.from('tools').select('id');
  if (!tools || tools.length === 0) {
    await seedInitialData();
  }

  console.log('数据库初始化完成');
};

const seedInitialData = async () => {
  const bcrypt = require('bcryptjs');
  
  const toolsData = [
    { id: 'json-formatter', name: 'JSON 格式化工具', category: '开发工具', description: '格式化和验证 JSON 数据', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'color-picker', name: '颜色选择器', category: '设计工具', description: '从屏幕任意位置拾取颜色值', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'qr-code-generator', name: '二维码生成器', category: '实用工具', description: '为网址、文本生成二维码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="9" y="9" width="6" height="6"/><circle cx="12" cy="12" r="1"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'password-generator', name: '密码生成器', category: '安全工具', description: '生成强随机密码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'base64-converter', name: 'Base64 编码/解码器', category: '开发工具', description: '对字符串进行 Base64 编码和解码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'unit-converter', name: '单位转换器', category: '实用工具', description: '在不同计量单位之间进行转换', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'timestamp-converter', name: '时间戳转换器', category: '开发工具', description: '在时间戳和人类可读时间之间转换', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'url-encoder', name: 'URL 编码/解码器', category: '开发工具', description: '对 URL 进行编码和解码', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'regex-tester', name: '正则表达式测试器', category: '开发工具', description: '测试和验证正则表达式', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'calculator', name: '计算器', category: '实用工具', description: '基础计算器，支持加减乘除', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>', featured: 0, usage_count: 0, views_count: 0, created_at: new Date().toISOString() },
    { id: 'sanguosha-game', name: '三国杀', category: '娱乐工具', description: '多人联机三国杀游戏，支持语音聊天', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', featured: 1, usage_count: 0, views_count: 0, created_at: new Date().toISOString() }
  ];

  await supabase.from('tools').insert(toolsData);

  const usersData = [
    { id: 'user-1', email: 'admin@toolbox.com', password: bcrypt.hashSync('123456', 10), username: '管理员', avatar_url: null, bio: '工具网站管理员', created_at: new Date().toISOString() },
    { id: 'user-2', email: 'test@example.com', password: bcrypt.hashSync('123456', 10), username: '测试用户', avatar_url: null, bio: '普通用户', created_at: new Date().toISOString() },
    { id: 'user-3', email: 'developer@code.com', password: bcrypt.hashSync('123456', 10), username: '开发者', avatar_url: null, bio: '全栈开发者', created_at: new Date().toISOString() },
  ];

  await supabase.from('users').insert(usersData);

  const commentsData = [
    { id: 'comment-1', user_id: 'user-1', tool_id: 'json-formatter', parent_id: null, content: '非常好用的JSON格式化工具！', rating: 5, likes: 2, created_at: new Date().toISOString() },
    { id: 'comment-2', user_id: 'user-2', tool_id: 'json-formatter', parent_id: 'comment-1', content: '同感！经常用这个工具', rating: 0, likes: 1, created_at: new Date().toISOString() },
    { id: 'comment-3', user_id: 'user-3', tool_id: 'json-formatter', parent_id: null, content: '界面简洁，功能强大！', rating: 5, likes: 3, created_at: new Date().toISOString() },
    { id: 'comment-4', user_id: 'user-1', tool_id: 'password-generator', parent_id: null, content: '密码生成器很实用', rating: 4, likes: 1, created_at: new Date().toISOString() },
    { id: 'comment-5', user_id: 'user-2', tool_id: 'qr-code-generator', parent_id: null, content: '二维码生成速度很快！', rating: 5, likes: 4, created_at: new Date().toISOString() },
    { id: 'comment-6', user_id: 'user-3', tool_id: 'color-picker', parent_id: null, content: '颜色选择器很好用', rating: 4, likes: 2, created_at: new Date().toISOString() },
  ];

  await supabase.from('comments').insert(commentsData);
};

module.exports = {
  supabase,
  initDatabase
};
