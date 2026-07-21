// 工具卡片组件
// 用于展示单个工具的信息，包含图标、名称、描述和使用次数

import { Link } from 'react-router-dom';
import { Tool } from '../types';

// ToolCard 组件属性接口
interface ToolCardProps {
  tool: Tool;           // 工具对象
  featured?: boolean;   // 是否为精选工具
  style?: React.CSSProperties; // 自定义样式（可选）
}

const ToolCard = ({ tool, featured = false, style }: ToolCardProps) => {
  // 格式化使用次数显示
  const formatUsageCount = (count: number): string => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };
  
  return (
    <Link 
      to={`/tool/${tool.id}`} 
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
        featured 
          ? 'glass-card card-hover neon-glow' 
          : 'bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 card-hover'
      }`}
      style={style}
    >
      {/* 精选标记 */}
      {featured && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full text-xs font-medium text-white">
          精选
        </div>
      )}
      
      {/* 工具图标 */}
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
        featured 
          ? 'bg-gradient-to-br from-primary-500/20 to-blue-500/20 text-primary-400 group-hover:scale-110' 
          : 'bg-light-200/50 dark:bg-dark-600/50 text-gray-500 dark:text-gray-400 group-hover:text-primary-400 group-hover:scale-110'
      }`}>
        <div 
          dangerouslySetInnerHTML={{ __html: tool.icon }} 
          className="w-10 h-10"
        />
      </div>
      
      {/* 工具名称 */}
      <h3 className="text-gray-800 dark:text-white font-semibold text-lg mb-2 group-hover:text-primary-400 transition-colors">
        {tool.name}
      </h3>
      
      {/* 工具描述 */}
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {tool.description}
      </p>
      
      {/* 底部信息 */}
      <div className="flex items-center justify-between">
        {/* 分类标签 */}
        <span className="px-3 py-1 bg-light-200/50 dark:bg-dark-600/50 rounded-full text-xs text-gray-500 dark:text-gray-400">
          {tool.category}
        </span>
        
        {/* 统计信息 */}
        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 text-sm">
          {/* 使用次数 */}
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>{formatUsageCount(tool.usage_count)}</span>
          </div>
          {/* 浏览量 */}
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{formatUsageCount(tool.views_count || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* 悬停时的背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
};

export default ToolCard;
