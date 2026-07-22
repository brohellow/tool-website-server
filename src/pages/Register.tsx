import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { signUp, sendCode } from '../utils/api';
import { RegisterFormData } from '../types';

const Register = () => {
  const { setUser } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const handleSendCode = async () => {
    if (!formData.email) {
      setError('请输入邮箱地址');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    setCodeLoading(true);
    setError('');
    
    try {
      const data = await sendCode(formData.email);
      if (data.debugCode) {
        console.log('调试模式验证码:', data.debugCode);
      }
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };
  
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
      setError('请填写完整的注册信息');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (formData.username.length < 2) {
      setError('用户名长度至少为2位');
      return;
    }
    
    if (!code) {
      setError('请输入验证码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { user } = await signUp(formData.email, formData.password, formData.username, code);
      
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          username: formData.username,
          avatar_url: '',
          created_at: user.created_at,
        });
        
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="page-transition pt-20">
      <section className="min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="glass-card p-8 neon-glow">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </div>
              <h1 className="font-orbitron text-3xl font-bold text-white mb-2">
                创建账号
              </h1>
              <p className="text-gray-400">欢迎加入工具乐园，注册即可使用全部功能</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">用户名</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入用户名"
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
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
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">验证码</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                    }}
                    placeholder="请输入验证码"
                    maxLength={6}
                    className="flex-1 bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={codeLoading || countdown > 0}
                    className="px-4 py-3 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {codeLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      '发送'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">密码</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码（至少6位）"
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">确认密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
              
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
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                已有账号？
                <Link to="/login" className="text-primary-400 hover:text-primary-300 ml-1 transition-colors">
                  立即登录
                </Link>
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                注册即表示您同意我们的
                <a href="#" className="text-primary-400 hover:text-primary-300">服务条款</a>
                和
                <a href="#" className="text-primary-400 hover:text-primary-300">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;