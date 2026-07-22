// 社区页面组件
// 展示所有评论、热门工具和工具建议功能（从数据库获取真实数据）

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getAllComments, getFeaturedTools } from '../utils/api';
import { Comment as CommentType, Tool } from '../types';

// 模拟建议数据（建议功能需要额外的数据库表支持）
const mockSuggestions = [
  { id: '1', title: 'Markdown 编辑器', votes: 128, status: 'pending' },
  { id: '2', title: '图片压缩工具', votes: 96, status: 'in-progress' },
  { id: '3', title: 'PDF 转换工具', votes: 74, status: 'pending' },
  { id: '4', title: '时间戳转换器', votes: 52, status: 'completed' },
];

const Community = () => {
  // 获取用户状态
  const { user } = useStore();
  
  // 状态管理（从数据库获取）
  const [comments, setComments] = useState<CommentType[]>([]);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 建议表单状态
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 从数据库获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取评论列表和精选工具
        const [commentsData, toolsData] = await Promise.all([
          getAllComments(),
          getFeaturedTools(),
        ]);
        
        setComments(commentsData || []);
        setFeaturedTools(toolsData || []);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 获取状态标签样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-500/20 text-accent-400';
      case 'in-progress':
        return 'bg-primary-500/20 text-primary-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  // 获取状态文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '开发中';
      default:
        return '待审核';
    }
  };
  
  // 处理提交建议
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestionTitle.trim()) {
      return;
    }
    
    // 模拟提交建议
    setShowSuccess(true);
    setSuggestionTitle('');
    setSuggestionDescription('');
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  return (
    <div className="page-transition pt-20">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-accent-500 text-white rounded-xl shadow-lg">
          建议提交成功！
        </div>
      )}
      
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
          
          {/* 页面头部 */}
          <section className="py-12 bg-dark-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4">
                  工具乐园社区
                </h1>
                <p className="text-gray-400">与其他用户交流分享，一起让工具更好用</p>
              </div>
            </div>
          </section>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧：评论列表 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 评论标题 */}
                <div className="flex items-center justify-between">
                  <h2 className="font-orbitron text-2xl font-bold text-white">最新评论</h2>
                  <span className="text-gray-500 text-sm">{comments.length} 条评论</span>
                </div>
                
                {/* 评论列表 */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => {
                      const tool = comment.tool || { name: '未知工具', id: comment.tool_id };
                      
                      return (
                        <div key={comment.id} className="glass-card p-6">
                          <div className="flex items-start gap-4">
                            {/* 用户头像 */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-white">
                                {comment.user?.username?.charAt(0).toUpperCase() || comment.user?.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            
                            {/* 评论内容 */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">
                                  {comment.user?.username || comment.user?.email}
                                </h4>
                                <Link 
                                  to={`/tool/${comment.tool_id}`}
                                  className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs"
                                >
                                  {tool.name}
                                </Link>
                              </div>
                              
                              <p className="text-gray-300 mb-3">{comment.content}</p>
                              
                              <div className="flex items-center justify-between">
                                {/* 评分 */}
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-sm">
                                      {i < comment.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                
                                {/* 时间 */}
                                <p className="text-gray-500 text-sm">
                                  {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">暂无评论，快来发表第一条评论吧！</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 右侧：热门工具和建议 */}
              <div className="space-y-8">
                {/* 热门工具 */}
                <div className="glass-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-white mb-4">热门工具</h3>
                  <div className="space-y-4">
                    {featuredTools.slice(0, 3).map((tool) => (
                      <Link
                        key={tool.id}
                        to={`/tool/${tool.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/50 hover:bg-dark-600/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                          <div 
                            dangerouslySetInnerHTML={{ __html: tool.icon }} 
                            className="w-6 h-6 text-primary-400"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{tool.name}</h4>
                          <p className="text-gray-500 text-xs">{tool.usage_count?.toLocaleString() || 0} 次使用</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* 工具建议 */}
                <div className="glass-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-white mb-4">工具建议</h3>
                  
                  {/* 建议列表 */}
                  <div className="space-y-3 mb-6">
                    {mockSuggestions.map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/50"
                      >
                        <button className="w-8 h-8 rounded-lg bg-dark-600/50 flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-primary-500/20 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v10"/>
                            <path d="M5 9h14"/>
                          </svg>
                        </button>
                        <div className="flex-1">
                          <h4 className="text-white text-sm">{suggestion.title}</h4>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getStatusStyle(suggestion.status)}`}>
                            {getStatusText(suggestion.status)}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">{suggestion.votes}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 提交建议表单 */}
                  {user ? (
                    <form onSubmit={handleSubmitSuggestion}>
                      <h4 className="text-gray-400 text-sm mb-3">提交新建议</h4>
                      <input
                        type="text"
                        value={suggestionTitle}
                        onChange={(e) => setSuggestionTitle(e.target.value)}
                        placeholder="工具名称"
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-colors mb-3"
                      />
                      <textarea
                        value={suggestionDescription}
                        onChange={(e) => setSuggestionDescription(e.target.value)}
                        placeholder="详细描述..."
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-colors mb-3 resize-none"
                        rows={3}
                      />
                      <button type="submit" className="w-full py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-colors text-sm font-medium">
                        提交建议
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-3">登录后提交建议</p>
                      <Link to="/login" className="text-primary-400 hover:text-primary-300 text-sm">
                        登录
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* 社区统计 */}
                <div className="glass-card p-6">
                  <h3 className="font-orbitron text-lg font-bold text-white mb-4">社区统计</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">1.2k</div>
                      <div className="text-gray-500 text-sm">活跃用户</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">5.8k</div>
                      <div className="text-gray-500 text-sm">总评论数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">50+</div>
                      <div className="text-gray-500 text-sm">工具建议</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">98%</div>
                      <div className="text-gray-500 text-sm">好评率</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Community;
