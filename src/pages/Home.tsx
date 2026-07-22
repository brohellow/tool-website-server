// 首页组件
// 包含 Hero 区域、工具分类、精选工具和工具列表

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { icons } from '../assets/icons';
import { getTools, getFeaturedTools, getCategories, searchTools } from '../utils/api';
import ToolCard from '../components/ToolCard';
import { Tool, Category } from '../types';

const Home = () => {
  // 获取搜索关键词
  const { searchQuery } = useStore();
  
  // 工具列表状态（从数据库获取）
  const [tools, setTools] = useState<Tool[]>([]);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 从数据库获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [toolsData, featuredData, categoriesData] = await Promise.all([
        getTools(),
        getFeaturedTools(),
        getCategories(),
      ]);
      setTools(toolsData || []);
      setFilteredTools(toolsData || []);
      setFeaturedTools(featuredData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('获取数据失败:', err);
      setError('获取数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 搜索工具
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredTools(tools);
      return;
    }
    
    try {
      setLoading(true);
      const searchResults = await searchTools(query);
      setFilteredTools(searchResults || []);
    } catch (err) {
      console.error('搜索失败:', err);
      setFilteredTools(tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase()) ||
          tool.category.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);
  
  // 加载状态
  if (loading) {
    return (
      <div className="page-transition pt-20 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="page-transition pt-20 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3 className="text-gray-800 dark:text-white font-semibold mb-2">加载失败</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => fetchData()} className="btn-primary inline-block">
          重试
        </button>
      </div>
    );
  }
  
  return (
    <div className="page-transition pt-20">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden py-20">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900" />
        
        {/* 粒子背景效果 */}
        <div className="particles-bg">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        
        {/* 内容区域 */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* 标题 */}
            <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">创意工具</span>
              <br />
              <span className="text-gray-800 dark:text-white">触手可及</span>
            </h1>
            
            {/* 副标题 */}
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-10">
              汇集多种实用在线工具，为您提供便捷高效的服务体验
            </p>
            
            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/tools/开发工具" 
                className="btn-primary text-center"
              >
                浏览全部工具
              </Link>
              <Link 
                to="/community" 
                className="border border-primary-500/50 text-primary-400 px-6 py-3 rounded-xl hover:bg-primary-500/10 transition-all text-center"
              >
                加入社区
              </Link>
            </div>
            
            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {tools.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">实用工具</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  50k+
                </div>
                <div className="text-gray-500 dark:text-gray-400">用户使用</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {categories.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">工具分类</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部波浪效果 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#0a0a0f"/>
          </svg>
        </div>
      </section>
      
      {/* 工具分类区域 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              工具分类
            </h2>
            <p className="text-gray-500 dark:text-gray-400">选择您需要的工具类别</p>
          </div>
          
          {/* 分类卡片网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const categoryIcons: { [key: string]: string } = {
                '开发工具': icons.development,
                '设计工具': icons.design,
                '实用工具': icons.utilities,
                '安全工具': icons.security,
              };
              const icon = categoryIcons[category.name] || icons.utilities;
              
              return (
                <Link
                  key={category.name}
                  to={`/tools/${category.name}`}
                  className="group relative rounded-2xl p-6 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                    <div 
                      dangerouslySetInnerHTML={{ __html: icon }} 
                      className="w-8 h-8 text-primary-400"
                    />
                  </div>
                  <h3 className="text-gray-800 dark:text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {category.count} 个工具
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* 精选工具区域 */}
      <section className="py-16 bg-light-100/30 dark:bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                精选工具
              </h2>
              <p className="text-gray-500 dark:text-gray-400">最受欢迎的实用工具</p>
            </div>
            <Link 
              to="/tools/实用工具" 
              className="hidden md:flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <span>查看更多</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
          
          {/* 精选工具卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 grid-stagger">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} featured />
            ))}
          </div>
        </div>
      </section>
      
      {/* 所有工具区域 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                全部工具
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? `搜索结果: ${filteredTools.length} 个工具` : '浏览所有可用工具'}
              </p>
            </div>
          </div>
          
          {/* 工具列表 */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map((tool, index) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-light-100/50 dark:bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3 className="text-gray-800 dark:text-white font-semibold mb-2">未找到匹配的工具</h3>
              <p className="text-gray-500 dark:text-gray-400">尝试使用其他关键词搜索</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
