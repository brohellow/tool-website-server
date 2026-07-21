// 工具数据文件，存储所有工具的模拟数据
// 实际项目中这些数据会从数据库中获取

import { Tool, Category } from '../types';

// 工具图标 SVG 定义
export const icons = {
  // JSON 格式化工具图标
  json: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  
  // 颜色选择器图标
  color: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>`,
  
  // 二维码生成器图标
  qrcode: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="9" y="9" width="6" height="6"/><circle cx="12" cy="12" r="1"/></svg>`,
  
  // 密码生成器图标
  password: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>`,
  
  // Base64 编码/解码器图标
  base64: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  
  // 单位转换器图标
  converter: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  
  // 开发工具分类图标
  development: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="2" x2="20" y2="8"/><rect x="2" y="14" x2="8" y2="20"/><path d="M20 2L10 12"/><path d="M14 20L4 10"/></svg>`,
  
  // 设计工具分类图标
  design: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  
  // 实用工具分类图标
  utilities: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  
  // 安全工具分类图标
  security: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
};

// 工具分类列表
export const categories: Category[] = [
  {
    name: '开发工具',
    icon: icons.development,
    count: 2,
  },
  {
    name: '设计工具',
    icon: icons.design,
    count: 1,
  },
  {
    name: '实用工具',
    icon: icons.utilities,
    count: 2,
  },
  {
    name: '安全工具',
    icon: icons.security,
    count: 1,
  },
];

// 工具列表数据
export const tools: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化工具',
    category: '开发工具',
    description: '格式化和验证 JSON 数据，支持语法高亮显示和错误提示',
    icon: icons.json,
    featured: true,
    usage_count: 12345,
    views_count: 23456,
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    category: '设计工具',
    description: '从屏幕任意位置拾取颜色值，支持多种颜色格式输出（HEX、RGB、HSL）',
    icon: icons.color,
    featured: true,
    usage_count: 8923,
    views_count: 15678,
  },
  {
    id: 'qr-code-generator',
    name: '二维码生成器',
    category: '实用工具',
    description: '为网址、文本、联系方式等生成二维码，支持自定义尺寸和颜色',
    icon: icons.qrcode,
    featured: true,
    usage_count: 15678,
    views_count: 28901,
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    category: '安全工具',
    description: '生成强随机密码，支持自定义长度、字符类型和排除字符',
    icon: icons.password,
    featured: true,
    usage_count: 6789,
    views_count: 12345,
  },
  {
    id: 'base64-converter',
    name: 'Base64 编码/解码器',
    category: '开发工具',
    description: '对字符串进行 Base64 编码和解码，支持批量处理和文件转换',
    icon: icons.base64,
    featured: false,
    usage_count: 4523,
    views_count: 8923,
  },
  {
    id: 'unit-converter',
    name: '单位转换器',
    category: '实用工具',
    description: '在不同计量单位之间进行转换，包括长度、重量、面积、温度等',
    icon: icons.converter,
    featured: false,
    usage_count: 3210,
    views_count: 6543,
  },
];

// 根据 ID 获取工具
export const getToolById = (id: string): Tool | undefined => {
  return tools.find((tool) => tool.id === id);
};

// 根据分类获取工具列表
export const getToolsByCategory = (category: string): Tool[] => {
  return tools.filter((tool) => tool.category === category);
};

// 获取精选工具列表
export const getFeaturedTools = (): Tool[] => {
  return tools.filter((tool) => tool.featured);
};

// 搜索工具
export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
};
