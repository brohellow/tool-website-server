// 首页组件
// 包含 Hero 区域、工具分类、精选工具和工具列表

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { icons } from '../assets/icons';
import { getTools, getFeaturedTools, getCategories, searchTools } from '../utils/api';
import ToolCard from '../components/ToolCard';
import { Tool, Category } from '../types';

const Home = () => {
  const { searchQuery, setSearchQuery, searchHistory, addSearchHistory, clearSearchHistory } = useStore();
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 工具列表状态（从数据库获取）
  const [tools, setTools] = useState<Tool[]>([]);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 天气预报状态
  const [weatherCity, setWeatherCity] = useState('北京');
  const [weatherData, setWeatherData] = useState<{ 
    city?: string; 
    forecast?: { date: string; minTemp: string; maxTemp: string; desc: string; humidity: string; wind: string }[];
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'failed' | 'manual'>('loading');
  
  const getWeatherEmoji = (desc: string) => {
    if (desc.includes('晴')) return '☀️';
    if (desc.includes('云')) return '☁️';
    if (desc.includes('雨')) return '🌧️';
    if (desc.includes('雪')) return '❄️';
    if (desc.includes('雷')) return '⛈️';
    if (desc.includes('雾')) return '🌫️';
    if (desc.includes('阴')) return '☁️';
    return '🌤️';
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';
    
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekDays[date.getDay()];
  };
  
  const fetchWeather = async (city: string) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather-forecast/${encodeURIComponent(city)}`);
      const data = await response.json();
      if (data.city && data.forecast && data.forecast.length > 0) {
        setWeatherData({
          city: data.city,
          forecast: data.forecast,
        });
      }
    } catch {
      console.error('获取天气失败');
    } finally {
      setWeatherLoading(false);
    }
  };
  
  const getCityByLocation = async () => {
    return new Promise<string>((resolve) => {
      if (!navigator.geolocation) {
        resolve('');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=zh&format=json`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              resolve(data.results[0].name || '');
            } else {
              resolve('');
            }
          } catch {
            resolve('');
          }
        },
        () => {
          resolve('');
        },
        { timeout: 5000 }
      );
    });
  };
  
  useEffect(() => {
    const initWeather = async () => {
      const city = await getCityByLocation();
      if (city) {
        setWeatherCity(city);
        setLocationStatus('success');
      } else {
        setLocationStatus('failed');
      }
      await fetchWeather(city || '北京');
    };
    initWeather();
  }, []);
  
  const handleCityChange = (city: string) => {
    setWeatherCity(city);
    setLocationStatus('manual');
    fetchWeather(city);
  };
  
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
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
    }
    setShowSearchHistory(false);
  };
  
  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    addSearchHistory(query);
    setShowSearchHistory(false);
  };
  
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
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* 左侧：天气预报 */}
            <div className="hidden lg:block w-48 shrink-0">
              <div className="glass-card rounded-xl overflow-hidden">
                {/* 上层：当前城市和今天天气 */}
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <input
                      type="text"
                      value={weatherCity}
                      onChange={(e) => setWeatherCity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCityChange(e.currentTarget.value)}
                      className="bg-transparent border-b border-primary-500/30 px-1 py-0.5 text-sm font-semibold text-white focus:outline-none focus:border-primary-500 text-center w-20"
                      placeholder="城市"
                    />
                    {locationStatus === 'loading' && (
                      <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    )}
                  </div>
                  {weatherLoading ? (
                    <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                  ) : weatherData && weatherData.forecast && weatherData.forecast.length > 0 ? (
                    <>
                      <div className="text-3xl mb-1">{getWeatherEmoji(weatherData.forecast[0].desc)}</div>
                      <div className="text-2xl font-bold text-white">{weatherData.forecast[0].maxTemp}</div>
                      <div className="text-gray-400 text-xs">{weatherData.forecast[0].desc}</div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-xs">暂无数据</div>
                  )}
                </div>
                
                {/* 下层：滚动播放未来天气 */}
                <div className="px-3 pb-3 pt-1 bg-dark-800/50">
                  {weatherData && weatherData.forecast && weatherData.forecast.length > 1 ? (
                    <div className="flex overflow-hidden">
                      <div className="flex animate-scroll">
                        {[...weatherData.forecast.slice(1), ...weatherData.forecast.slice(1)].map((day, index) => (
                          <div key={index} className="flex-shrink-0 w-14 mx-1.5 bg-dark-700/50 rounded-lg p-2 text-center">
                            <div className="text-gray-400 text-xs mb-0.5">{formatDate(day.date)}</div>
                            <div className="text-lg mb-0.5">{getWeatherEmoji(day.desc)}</div>
                            <div className="text-white text-xs">{day.maxTemp}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            
            {/* 右侧：主要内容 */}
            <div className="text-center max-w-3xl">
              {/* 标题 */}
              <h1 className="font-orbitron text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6">
                <span className="gradient-text">创意工具</span>
                <br />
                <span className="text-gray-800 dark:text-white">触手可及</span>
              </h1>
              
              {/* 副标题 */}
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg md:text-xl mb-6 md:mb-10 px-4">
                汇集多种实用在线工具，为您提供便捷高效的服务体验
              </p>
              
              {/* CTA 按钮 */}
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
                <Link 
                  to="/tools/开发工具" 
                  className="btn-primary text-center py-3 sm:py-4"
                >
                  浏览全部工具
                </Link>
                <Link 
                  to="/community" 
                  className="border border-primary-500/50 text-primary-400 px-6 py-3 sm:py-4 rounded-xl hover:bg-primary-500/10 transition-all text-center"
                >
                  加入社区
                </Link>
              </div>
              
              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-10 md:mt-16 px-4">
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 md:mb-2">
                    {tools.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">实用工具</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 md:mb-2">
                    50k+
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">用户使用</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 md:mb-2">
                    {categories.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">工具分类</div>
                </div>
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
      
      {/* 搜索区域 */}
      <section className="py-8 bg-light-100/30 dark:bg-dark-800/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={searchContainerRef} className="relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="搜索工具..."
                  value={searchQuery}
                  onChange={(e) => {
                    if (isComposing) return;
                    const value = e.target.value;
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }
                    debounceRef.current = setTimeout(() => {
                      setSearchQuery(value);
                      setShowSearchHistory(value === '');
                    }, 300);
                  }}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(e) => {
                    setIsComposing(false);
                    setSearchQuery(e.currentTarget.value);
                    setShowSearchHistory(e.currentTarget.value === '');
                  }}
                  onFocus={() => setShowSearchHistory(true)}
                  className="w-full bg-white/80 dark:bg-dark-700/80 border border-primary-500/30 rounded-xl py-3 pl-12 pr-4 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-lg"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </form>
            
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-card border-primary-500/20 shadow-xl">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">搜索历史</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-primary-400 hover:text-primary-500"
                    >
                      清空
                    </button>
                  </div>
                  {searchHistory.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(query)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary-500/10 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
