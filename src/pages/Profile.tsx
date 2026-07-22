import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getFavorites, getAllComments, getUserViews, deleteUserView, updateUserProfile, changePassword } from '../utils/api';
import { Tool, Comment } from '../types';
import { formatFullDate, formatDateTime } from '../utils/date';

type TabType = 'profile' | 'favorites' | 'history' | 'comments' | 'settings';

const Profile = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [userViews, setUserViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    avatar_url: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [themePreference, setThemePreference] = useState('dark');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    setProfileForm({
      username: user.username || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
    });
    setThemePreference(localStorage.getItem('theme') || 'dark');
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [favoritesData, allComments, viewsData] = await Promise.all([
        getFavorites(user.id),
        getAllComments(),
        getUserViews(user.id),
      ]);
      
      const favorites = favoritesData || [];
      const tools = favorites.map((f: any) => ({
        id: f.tool_id,
        name: f.name,
        description: f.description,
        category: f.category,
        icon: f.icon,
        featured: f.featured,
        usage_count: f.usage_count,
        views_count: f.views_count,
        created_at: f.created_at,
      }));
      setFavoriteTools(tools);
      
      const comments = allComments.filter((c: Comment) => c.user_id === user.id) || [];
      setUserComments(comments);
      
      setUserViews(viewsData || []);
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfile(user.id, profileForm);
      setUser({ ...user, ...updatedUser });
      setEditingProfile(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('更新资料失败:', err);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      await deleteUserView(viewId);
      setUserViews(userViews.filter(v => v.id !== viewId));
    } catch (err) {
      console.error('删除浏览记录失败:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('确定要清空所有浏览历史吗？')) return;
    try {
      for (const view of userViews) {
        await deleteUserView(view.id);
      }
      setUserViews([]);
    } catch (err) {
      console.error('清空浏览历史失败:', err);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setThemePreference(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
    if (user) {
      setUser({ ...user, theme: newTheme });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度至少为6位');
      return;
    }
    
    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || '修改密码失败');
    }
  };

  const sidebarItems = [
    { id: 'profile' as TabType, label: '个人资料', icon: 'user' },
    { id: 'favorites' as TabType, label: '收藏工具', icon: 'heart' },
    { id: 'history' as TabType, label: '浏览历史', icon: 'history' },
    { id: 'comments' as TabType, label: '我的评论', icon: 'message-square' },
    { id: 'settings' as TabType, label: '账号设置', icon: 'settings' },
  ];

  const renderIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
      'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    };
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: icons[iconName] || icons.user }} />;
  };

  if (loading) {
    return (
      <div className="page-transition pt-20 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-transition pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="glass-card p-6 sticky top-24">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4 overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="头像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {editingProfile && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-600 transition-colors shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setProfileForm({ ...profileForm, avatar_url: event.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{user.username || '用户'}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              </div>
              
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-200 dark:hover:bg-dark-700/50'
                    }`}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-light-200 dark:border-dark-600">
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_token');
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </aside>
          
          <main className="flex-1">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-orbitron text-2xl font-bold text-gray-800 dark:text-white">个人资料</h2>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                      {editingProfile ? '取消编辑' : '编辑资料'}
                    </button>
                  </div>
                  
                  {showSuccess && (
                    <div className="mb-6 p-4 bg-green-500/20 text-green-400 rounded-xl flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      资料更新成功！
                    </div>
                  )}
                  
                  {editingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">用户名</label>
                        <input
                          type="text"
                          value={profileForm.username}
                          onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                          className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                          placeholder="请输入用户名"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">个人简介</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
                          rows={4}
                          placeholder="介绍一下你自己..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">邮箱</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-800/50 dark:border-dark-700 rounded-xl text-gray-600 dark:text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold"
                      >
                        保存修改
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4">
                          <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">用户名</div>
                          <div className="text-gray-800 dark:text-white font-semibold">{user.username || '未设置'}</div>
                        </div>
                        <div className="glass-card p-4">
                          <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">邮箱</div>
                          <div className="text-gray-800 dark:text-white font-semibold">{user.email}</div>
                        </div>
                      </div>
                      <div className="glass-card p-4">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">个人简介</div>
                        <div className="text-gray-600 dark:text-gray-300">{user.bio || '暂无简介'}</div>
                      </div>
                      <div className="glass-card p-4">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">注册时间</div>
                        <div className="text-gray-600 dark:text-gray-300">{formatFullDate(user.created_at)}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">数据统计</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-light-100/50 dark:bg-dark-700/50 rounded-xl">
                      <div className="text-3xl font-bold gradient-text mb-1">{favoriteTools.length}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">收藏工具</div>
                    </div>
                    <div className="text-center p-4 bg-light-100/50 dark:bg-dark-700/50 rounded-xl">
                      <div className="text-3xl font-bold gradient-text mb-1">{userComments.length}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">发表评论</div>
                    </div>
                    <div className="text-center p-4 bg-light-100/50 dark:bg-dark-700/50 rounded-xl">
                      <div className="text-3xl font-bold gradient-text mb-1">{userViews.length}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">浏览历史</div>
                    </div>
                    <div className="text-center p-4 bg-light-100/50 dark:bg-dark-700/50 rounded-xl">
                      <div className="text-3xl font-bold gradient-text mb-1">
                        {userComments.reduce((sum, c) => sum + (c.likes || 0), 0)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">获得点赞</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div className="glass-card p-8">
                <h2 className="font-orbitron text-2xl font-bold text-gray-800 dark:text-white mb-6">我的收藏</h2>
                
                {favoriteTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteTools.map((tool) => (
                      <Link
                        key={tool.id}
                        to={`/tool/${tool.id}`}
                        className="group rounded-2xl p-6 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 card-hover"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                          <div 
                            dangerouslySetInnerHTML={{ __html: tool.icon }} 
                            className="w-8 h-8 text-primary-400"
                          />
                        </div>
                        <h3 className="text-gray-800 dark:text-white font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{tool.description}</p>
                        <div className="mt-4 flex items-center gap-4 text-gray-500 dark:text-gray-500 text-xs">
                          <span>{tool.category}</span>
                          <span>浏览 {tool.views_count}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-light-100/50 dark:bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-semibold mb-2">暂无收藏</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">快去收藏您喜欢的工具吧！</p>
                    <Link to="/" className="btn-primary inline-block">
                      浏览工具
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-orbitron text-2xl font-bold text-gray-800 dark:text-white">浏览历史</h2>
                  {userViews.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      清空历史
                    </button>
                  )}
                </div>
                
                {userViews.length > 0 ? (
                  <div className="space-y-3">
                    {userViews.map((view) => (
                      <div
                        key={view.id}
                        className="flex items-center gap-4 p-4 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl hover:border-light-300 dark:hover:border-dark-500 transition-all group"
                      >
                        <Link to={`/tool/${view.tool_id}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                            <div 
                              dangerouslySetInnerHTML={{ __html: view.icon }} 
                              className="w-6 h-6 text-primary-400"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/tool/${view.tool_id}`} className="text-gray-800 dark:text-white font-semibold hover:text-primary-400 transition-colors">
                            {view.name}
                          </Link>
                          <p className="text-gray-500 dark:text-gray-500 text-sm truncate">{view.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-gray-500 dark:text-gray-500 text-xs">{view.category}</span>
                            <span className="text-gray-500 dark:text-gray-500 text-xs">
                              {formatDateTime(view.created_at)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteView(view.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-light-100/50 dark:bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-semibold mb-2">暂无浏览记录</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">浏览工具后会在这里显示历史记录</p>
                    <Link to="/" className="btn-primary inline-block">
                      浏览工具
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'comments' && (
              <div className="glass-card p-8">
                <h2 className="font-orbitron text-2xl font-bold text-gray-800 dark:text-white mb-6">我的评论</h2>
                
                {userComments.length > 0 ? (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div key={comment.id} className="p-6 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <Link to={`/tool/${comment.tool_id}`} className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-semibold">
                                {comment.tool_name || '工具'}
                              </Link>
                              <span className="text-gray-400">|</span>
                              <span className="text-gray-500 dark:text-gray-500 text-sm">
                                {formatFullDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="text-sm">
                                    {i < (comment.rating || 5) ? '⭐' : '☆'}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                                <span>{comment.likes || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-light-100/50 dark:bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-gray-800 dark:text-white font-semibold mb-2">暂无评论</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">去工具页面发表您的评论吧！</p>
                    <Link to="/" className="btn-primary inline-block">
                      浏览工具
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="glass-card p-8">
                <h2 className="font-orbitron text-2xl font-bold text-gray-800 dark:text-white mb-6">账号设置</h2>
                
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                      </svg>
                      外观设置
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-700 dark:text-gray-300">主题模式</div>
                        <div className="text-gray-500 text-sm">选择深色或浅色主题</div>
                      </div>
                      <select
                        value={themePreference}
                        onChange={handleThemeChange}
                        className="px-4 py-2 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white focus:border-primary-500 focus:outline-none"
                      >
                        <option value="dark">深色模式</option>
                        <option value="light">浅色模式</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      账号安全
                    </h3>
                    <div className="space-y-4">
                      <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl hover:border-light-300 dark:hover:border-dark-500 transition-all group">
                        <div className="text-left">
                          <div className="text-gray-700 dark:text-gray-300">修改密码</div>
                          <div className="text-gray-500 text-sm">定期更换密码以保护账号安全</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl hover:border-light-300 dark:hover:border-dark-500 transition-all group">
                        <div className="text-left">
                          <div className="text-gray-700 dark:text-gray-300">绑定邮箱</div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 dark:text-green-400">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="4"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      通知设置
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300">评论回复通知</div>
                          <div className="text-gray-500 text-sm">当有人回复您的评论时发送通知</div>
                        </div>
                        <button className="w-12 h-6 bg-green-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-all"></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300">点赞通知</div>
                          <div className="text-gray-500 text-sm">当有人点赞您的评论时发送通知</div>
                        </div>
                        <button className="w-12 h-6 bg-green-500 rounded-full relative">
                          <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition-all"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 bg-red-500/10 border-red-500/30">
                    <h3 className="font-semibold text-red-500 dark:text-red-400 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      危险操作
                    </h3>
                    <button className="w-full py-3 border border-red-500/50 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-500/10 transition-all">
                      删除账号
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-light-200 dark:border-dark-600">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-orbitron text-xl font-bold text-gray-800 dark:text-white">修改密码</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-light-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl text-sm">
                  {passwordError}
                </div>
              )}
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">当前密码</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    placeholder="请输入当前密码"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">新密码</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    placeholder="请输入新密码（至少6位）"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 dark:text-gray-400 text-sm mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-light-100/50 border border-light-200 dark:bg-dark-700/50 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    placeholder="请再次输入新密码"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 border border-light-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-light-100 dark:hover:bg-dark-700 transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold"
                  >
                    确认修改
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;