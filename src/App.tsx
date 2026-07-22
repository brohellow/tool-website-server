// 主应用组件
// 配置路由和全局布局

import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { getCurrentUser } from './utils/api';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import CategoryPage from './pages/CategoryPage';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Login from './pages/Login';
import Register from './pages/Register';
import GameLobby from './pages/GameLobby';
import GameRoom from './pages/GameRoom';
import Chat from './pages/Chat';

function App() {
  // 获取全局状态和方法
  const { setUser, setLoading, theme } = useStore();

  // 应用初始化时检查用户登录状态和主题
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // 初始化主题
    document.body.className = theme;
  }, [setUser, setLoading, theme]);

  return (
    <Router>
      {/* 全局布局容器 */}
      <div className="min-h-screen">
        {/* 页面头部导航 - 始终显示 */}
        <Header />
        
        {/* 主内容区域 */}
        <main className="relative">
          {/* 粒子背景效果 */}
          <div className="particles-bg">
            {Array.from({ length: 30 }).map((_, i) => (
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
          
          {/* 路由配置 */}
          <Routes>
            {/* 首页 */}
            <Route path="/" element={<Home />} />
            
            {/* 工具分类页面 */}
            <Route path="/tools/:category" element={<CategoryPage />} />
            
            {/* 工具详情页面 */}
            <Route path="/tool/:id" element={<ToolPage />} />
            
            {/* 用户个人中心 */}
            <Route path="/profile" element={<Profile />} />
            
            {/* 社区页面 */}
            <Route path="/community" element={<Community />} />
            
            {/* 登录页面 */}
            <Route path="/login" element={<Login />} />
            
            {/* 注册页面 */}
            <Route path="/register" element={<Register />} />
            
            {/* 三国杀游戏大厅 */}
            <Route path="/game" element={<GameLobby />} />
            
            {/* 三国杀游戏房间 */}
            <Route path="/game/:id" element={<GameRoom />} />
            
            {/* 聊天室页面 */}
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
        
        {/* 页面底部 - 始终显示 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
