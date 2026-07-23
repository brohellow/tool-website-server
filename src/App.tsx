// 主应用组件
// 配置路由和全局布局

import { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { getCurrentUser } from './utils/api';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';

const Home = lazy(() => import('./pages/Home'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Community = lazy(() => import('./pages/Community'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const GameLobby = lazy(() => import('./pages/GameLobby'));
const GameRoom = lazy(() => import('./pages/GameRoom'));
const Chat = lazy(() => import('./pages/Chat'));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const { setUser, setLoading, theme } = useStore();

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
    
    document.body.className = theme;
  }, [setUser, setLoading, theme]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        
        <main className="relative">
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
          
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools/:category" element={<CategoryPage />} />
              <Route path="/tool/:id" element={<ToolPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/game" element={<GameLobby />} />
              <Route path="/game/:id" element={<GameRoom />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
        
        <Notification />
      </div>
    </Router>
  );
}

export default App;
