// 登录页面组件
// 提供用户登录功能，包含邮箱和密码输入表单

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signIn } from '../utils/api';
import { LoginFormData } from '../types';

const Login = () => {
  // 获取状态和方法
  const { setUser, loading } = useStore();
  const navigate = useNavigate();
  
  // 表单状态
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  // 错误信息状态
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除之前的错误信息
    setError('');
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.email || !formData.password) {
      setError('请填写完整的登录信息');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 调用登录 API
      const { user } = await signIn(formData.email, formData.password);
      
      if (user) {
        // 登录成功，更新全局用户状态
        setUser({
          id: user.id,
          email: user.email || '',
          username: user.username || '',
          avatar_url: user.avatar_url || '',
          created_at: user.created_at,
        });
        
        // 跳转到首页
        navigate('/');
      }
    } catch (err) {
      // 登录失败，显示错误信息
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 如果已经登录，直接跳转到首页
  if (loading) {
    return (
      <div className="page-transition pt-20 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="page-transition pt-20">
      <section className="min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          {/* 登录卡片 */}
          <div className="glass-card p-8 neon-glow">
            {/* 标题 */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h1 className="font-orbitron text-3xl font-bold text-gray-800 dark:text-white mb-2">
                用户登录
              </h1>
              <p className="text-gray-500 dark:text-gray-400">欢迎回来，请登录您的账号</p>
            </div>
            
            {/* 表单 */}
            <form onSubmit={handleSubmit}>
              {/* 邮箱输入框 */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">邮箱地址</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱地址"
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              {/* 密码输入框 */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">密码</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              {/* 错误信息 */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>
            
            {/* 注册链接 */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                还没有账号？
                <Link to="/register" className="text-primary-400 hover:text-primary-300 ml-1 transition-colors">
                  立即注册
                </Link>
              </p>
            </div>
            
            {/* 分割线 */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-dark-600" />
              <span className="px-4 text-gray-500 text-sm">或</span>
              <div className="flex-1 border-t border-dark-600" />
            </div>
            
            {/* 社交登录按钮（预留） */}
            <div className="space-y-3">
              <button className="w-full py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-gray-300 hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                使用 Google 登录
              </button>
              <button className="w-full py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-gray-300 hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                使用 GitHub 登录
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
