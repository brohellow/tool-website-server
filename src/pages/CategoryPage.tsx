// 分类页面组件
// 展示指定分类下的所有工具（从数据库获取真实数据）

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { icons } from '../data/tools';
import { getToolsByCategory, getCategories } from '../utils/api';
import ToolCard from '../components/ToolCard';
import { Tool, Category } from '../types';

const CategoryPage = () => {
  // 获取分类名称参数
  const { category } = useParams<{ category: string }>();
  
  // 状态管理（从数据库获取）
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 从数据库获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取当前分类的工具列表和所有分类信息
        const [toolsData, categoriesData] = await Promise.all([
          getToolsByCategory(category || ''),
          getCategories(),
        ]);
        
        setTools(toolsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [category]);
  
  // 获取当前分类信息
  const currentCategory = categories.find((c) => c.name === category);
  
  // 根据分类名称获取对应的图标
  const getCategoryIcon = (categoryName: string) => {
    const categoryIcons: { [key: string]: string } = {
      '开发工具': icons.development,
      '设计工具': icons.design,
      '实用工具': icons.utilities,
      '安全工具': icons.security,
    };
    return categoryIcons[categoryName] || icons.utilities;
  };
  
  return (
    <div className="page-transition pt-20">
      {/* 加载状态 */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
      
      {!loading && (
        <>
          {/* 错误提示 */}
          {error && (
            <div className="py-4 bg-red-500/10 border border-red-500/30 text-red-400 text-center">
              {error}
            </div>
          )}
          
          {/* 分类头部 */}
          <section className="py-12 bg-dark-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6">
                {/* 返回按钮 */}
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span>返回首页</span>
                </Link>
                
                {/* 分类标题 */}
                <div>
                  <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white">
                    {category || '工具分类'}
                  </h1>
                  <p className="text-gray-400 mt-2">
                    {currentCategory ? `${tools.length} 个工具` : '未找到该分类'}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* 工具列表 */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tools.map((tool, index) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      style={{ animationDelay: `${index * 0.05}s` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">未找到工具</h3>
                  <p className="text-gray-400 mb-4">该分类下暂无工具</p>
                  <Link to="/" className="btn-primary inline-block">
                    浏览所有工具
                  </Link>
                </div>
              )}
            </div>
          </section>
          
          {/* 其他分类推荐 */}
          <section className="py-12 bg-dark-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-orbitron text-2xl font-bold text-white mb-6">其他分类</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.filter((c) => c.name !== category).map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/tools/${cat.name}`}
                    className="group rounded-2xl p-6 bg-dark-700/50 border border-dark-600 card-hover"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                      <div 
                        dangerouslySetInnerHTML={{ __html: getCategoryIcon(cat.name) }} 
                        className="w-8 h-8 text-primary-400"
                      />
                    </div>
                    <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{cat.count} 个工具</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CategoryPage;
