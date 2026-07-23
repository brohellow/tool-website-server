// 页面头部导航组件
// 包含网站 Logo、导航链接、搜索框和用户菜单

import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signOut } from '../utils/api';

const Header = () => {
  // 获取状态和方法
  const { user, setUser, searchQuery, setSearchQuery, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  
  // 用户菜单展开状态
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Header 收起/展开状态
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 中文输入法组合状态
  const [isComposing, setIsComposing] = useState(false);
  
  // 防抖定时器引用
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 处理搜索输入变化（带防抖和中文输入法支持）
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return;
    
    const value = e.target.value;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, [isComposing, setSearchQuery]);
  
  // 处理中文输入法开始
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  
  // 处理中文输入法结束
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    setSearchQuery(e.currentTarget.value);
  };
  
  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };
  
  // 处理用户登出
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 glass-card transition-transform duration-300 ease-in-out"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{ transform: isExpanded ? 'translateY(0)' : 'translateY(calc(-100% + 40px))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 区域 */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              {/* Logo 图标 */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-shadow">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                  <line x1="12" y1="6" x2="12" y2="18"/>
                </svg>
              </div>
              {/* Logo 文字 */}
              <span className="font-orbitron text-xl font-bold gradient-text">
                工具乐园
              </span>
            </Link>
          </div>
          
          {/* 导航链接区域 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
            >
              首页
            </Link>
            <Link 
              to="/community" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
            >
              社区
            </Link>
            <Link 
              to="/chat" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
            >
              聊天室
            </Link>
            <Link 
              to="/profile" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors font-medium"
            >
              个人中心
            </Link>
          </nav>
          
          {/* 搜索框区域 */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索工具..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  className="w-full bg-light-100/50 border border-primary-500/30 dark:bg-dark-700/50 rounded-xl py-2 pl-10 pr-4 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
            </form>
          </div>
          
          {/* 用户区域 */}
          <div className="flex items-center space-x-4">
            {/* 主题切换按钮 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-light-200 dark:hover:bg-dark-600/50 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            
            {user ? (
              // 已登录状态
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 hover:bg-light-200 dark:hover:bg-dark-600/50 px-3 py-2 rounded-xl transition-colors"
                >
                  {/* 用户头像 */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* 用户名称 */}
                  <span className="hidden sm:inline text-gray-800 dark:text-white font-medium">
                    {user.username || user.email}
                  </span>
                </button>
                
                {/* 用户菜单 */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-xl border-primary-500/20">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-white transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      个人中心
                    </Link>
                    <Link 
                      to="/community" 
                      className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-white transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      社区
                    </Link>
                    <hr className="my-2 border-light-200 dark:border-dark-600" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 未登录状态
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-light-200 dark:hover:bg-dark-600/50"
                >
                  登录
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-primary-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all font-medium"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端导航栏 */}
      <div className="md:hidden border-t border-light-200 dark:border-dark-600/50">
          <div className="px-4 py-3">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={handleSearchChange}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                className="w-full bg-light-100/50 border border-primary-500/30 dark:bg-dark-700/50 rounded-xl py-2 pl-10 pr-4 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
            </form>
          </div>
          <nav className="flex justify-around py-2">
            <Link to="/" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span className="text-xs">首页</span>
            </Link>
            <Link to="/community" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-xs">社区</span>
            </Link>
            <Link to="/chat" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <span className="text-xs">聊天</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs">个人</span>
            </Link>
          </nav>
        </div>
    </header>
  );
};

export default Header;
