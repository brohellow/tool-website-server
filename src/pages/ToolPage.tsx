// 工具详情页面组件
// 包含工具展示、交互界面、评论区和收藏功能（从数据库获取真实数据）

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getToolById, getComments, addComment, addFavorite, removeFavorite, isFavorite, incrementUsageCount, likeComment } from '../utils/api';
import { Tool, Comment as CommentType, CommentFormData } from '../types';

const ToolPage = () => {
  // 获取工具 ID 参数
  const { id } = useParams<{ id: string }>();
  
  // 获取状态和方法
  const { user, addFavorite: addToFavorites, removeFavorite: removeFromFavorites } = useStore();
  
  // 工具信息状态（从数据库获取）
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 评论相关状态
  const [commentForm, setCommentForm] = useState<CommentFormData>({ content: '', rating: 5 });
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [replyForm, setReplyForm] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // JSON 格式化工具的状态
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  // 密码生成器工具的状态
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Base64 转换器工具的状态
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  
  // 颜色选择器工具的状态
  const [colorHex, setColorHex] = useState('#3b82f6');
  const [colorRgb, setColorRgb] = useState('rgb(59, 130, 246)');
  const [colorHsl, setColorHsl] = useState('hsl(217, 91%, 59%)');
  
  // 二维码生成器工具的状态
  const [qrContent, setQrContent] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrImage, setQrImage] = useState('');
  
  // 单位转换器工具的状态
  const [unitFrom, setUnitFrom] = useState('meter');
  const [unitTo, setUnitTo] = useState('kilometer');
  const [unitValue, setUnitValue] = useState('');
  const [unitResult, setUnitResult] = useState('');
  
  // 时间戳转换器工具的状态
  const [timestampInput, setTimestampInput] = useState('');
  const [timestampOutput, setTimestampOutput] = useState('');
  const [timestampMode, setTimestampMode] = useState<'to-time' | 'to-timestamp'>('to-timestamp');
  
  // URL 编码/解码器工具的状态
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');
  
  // 正则表达式测试器工具的状态
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestString, setRegexTestString] = useState('');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [regexError, setRegexError] = useState('');
  
  // 计算器工具的状态
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [calculatorMemory, setCalculatorMemory] = useState<string | null>(null);
  const [calculatorOperator, setCalculatorOperator] = useState<string | null>(null);
  
  // 从数据库获取数据（并行请求优化）
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 构建并行请求列表
        const requests = [
          getToolById(id || ''),
          getComments(id || '')
        ];
        
        // 仅当用户登录时添加收藏检查请求
        if (user) {
          requests.push(isFavorite(user.id, id || ''));
        }
        
        // 并行执行所有请求，减少总加载时间
        const results = await Promise.all(requests);
        
        // 解析并行结果
        const [toolData, commentsData] = results;
        const favorited = user ? results[2] : false;
        
        setTool(toolData || null);
        setComments(commentsData || []);
        setIsFavorited(favorited);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user]);
  
  // 处理 JSON 格式化
  const handleJsonFormat = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
      incrementUsageCount(id || '');
    } catch (error) {
      setJsonError('无效的 JSON 格式');
      setJsonOutput('');
    }
  };
  
  // 处理密码生成
  const handleGeneratePassword = async () => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
      setGeneratedPassword('请至少选择一种字符类型');
      return;
    }
    
    let password = '';
    const array = new Uint32Array(passwordLength);
    crypto.getRandomValues(array);
    for (let i = 0; i < passwordLength; i++) {
      password += charset[array[i] % charset.length];
    }
    setGeneratedPassword(password);
    incrementUsageCount(id || '');
  };
  
  // 处理 Base64 转换
  const handleBase64Convert = async () => {
    try {
      if (base64Mode === 'encode') {
        const encoded = btoa(base64Input);
        setBase64Output(encoded);
      } else {
        const decoded = atob(base64Input);
        setBase64Output(decoded);
      }
      incrementUsageCount(id || '');
    } catch (error) {
      setBase64Output('转换失败，请检查输入');
    }
  };
  
  // 处理颜色变化
  const handleColorChange = (hex: string) => {
    setColorHex(hex);
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    setColorRgb(`rgb(${r}, ${g}, ${b})`);
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    setColorHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
  };
  
  // 处理生成二维码
  const handleGenerateQrCode = async () => {
    if (!qrContent.trim()) {
      setQrImage('');
      return;
    }
    
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrContent)}&color=${qrColor.replace('#', '')}&bgcolor=${qrBgColor.replace('#', '')}`;
    setQrImage(url);
    incrementUsageCount(id || '');
  };
  
  // 单位转换系数
  const unitConversion: { [key: string]: number } = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    micrometer: 0.000001,
    nanometer: 0.000000001,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
    nautical_mile: 1852,
  };
  
  const unitNames: { [key: string]: string } = {
    meter: '米 (m)',
    kilometer: '千米 (km)',
    centimeter: '厘米 (cm)',
    millimeter: '毫米 (mm)',
    micrometer: '微米 (μm)',
    nanometer: '纳米 (nm)',
    mile: '英里 (mi)',
    yard: '码 (yd)',
    foot: '英尺 (ft)',
    inch: '英寸 (in)',
    nautical_mile: '海里 (nmi)',
  };
  
  // 处理单位转换
  const handleUnitConvert = async () => {
    const value = parseFloat(unitValue);
    if (isNaN(value)) {
      setUnitResult('');
      return;
    }
    
    const fromFactor = unitConversion[unitFrom];
    const toFactor = unitConversion[unitTo];
    
    const result = (value * fromFactor) / toFactor;
    setUnitResult(result.toFixed(6));
    incrementUsageCount(id || '');
  };
  
  // 处理时间戳转换
  const handleTimestampConvert = async () => {
    try {
      if (timestampMode === 'to-timestamp') {
        const date = new Date(timestampInput);
        if (isNaN(date.getTime())) {
          setTimestampOutput('无效的日期格式');
          return;
        }
        setTimestampOutput(`${date.getTime()}`);
      } else {
        const timestamp = parseInt(timestampInput);
        if (isNaN(timestamp)) {
          setTimestampOutput('无效的时间戳');
          return;
        }
        const date = new Date(timestamp);
        setTimestampOutput(date.toLocaleString('zh-CN'));
      }
      incrementUsageCount(id || '');
    } catch (error) {
      setTimestampOutput('转换失败');
    }
  };
  
  // 获取当前时间戳
  const handleGetCurrentTimestamp = () => {
    setTimestampInput(new Date().toLocaleString('zh-CN'));
    setTimestampMode('to-timestamp');
    handleTimestampConvert();
  };
  
  // 处理 URL 编码/解码
  const handleUrlConvert = async () => {
    try {
      if (urlMode === 'encode') {
        setUrlOutput(encodeURIComponent(urlInput));
      } else {
        setUrlOutput(decodeURIComponent(urlInput));
      }
      incrementUsageCount(id || '');
    } catch (error) {
      setUrlOutput('转换失败');
    }
  };
  
  // 处理正则表达式测试
  const handleRegexTest = () => {
    try {
      if (!regexPattern) {
        setRegexError('请输入正则表达式');
        setRegexMatches([]);
        return;
      }
      
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = regexTestString.match(regex) || [];
      setRegexMatches(matches);
      setRegexError('');
      incrementUsageCount(id || '');
    } catch (error) {
      setRegexError('无效的正则表达式');
      setRegexMatches([]);
    }
  };
  
  // 处理计算器输入
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculatorDisplay('0');
      setCalculatorMemory(null);
      setCalculatorOperator(null);
      return;
    }
    
    if (value === '=') {
      if (calculatorMemory && calculatorOperator) {
        const num1 = parseFloat(calculatorMemory);
        const num2 = parseFloat(calculatorDisplay);
        let result: number;
        
        switch (calculatorOperator) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '*': result = num1 * num2; break;
          case '/': result = num1 / num2; break;
          default: result = num2;
        }
        
        setCalculatorDisplay(result.toString());
        setCalculatorMemory(null);
        setCalculatorOperator(null);
      }
      return;
    }
    
    if (['+', '-', '*', '/'].includes(value)) {
      setCalculatorMemory(calculatorDisplay);
      setCalculatorOperator(value);
      setCalculatorDisplay('0');
      return;
    }
    
    if (value === '.') {
      if (!calculatorDisplay.includes('.')) {
        setCalculatorDisplay(calculatorDisplay + '.');
      }
      return;
    }
    
    if (calculatorDisplay === '0') {
      setCalculatorDisplay(value);
    } else {
      setCalculatorDisplay(calculatorDisplay + value);
    }
  };
  
  // 处理收藏点击
  const handleFavoriteClick = async () => {
    if (!user || !id) return;
    
    try {
      if (isFavorited) {
        await removeFavorite(id);
        removeFromFavorites(id);
      } else {
        await addFavorite(id);
        addToFavorites(id);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };
  
  // 处理提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !commentForm.content.trim()) return;
    
    try {
      await addComment(id, commentForm.content, commentForm.rating);
      
      const newComment: CommentType = {
        id: Date.now().toString(),
        user_id: user.id,
        tool_id: id,
        content: commentForm.content,
        rating: commentForm.rating,
        likes: 0,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username || '',
        },
      };
      
      setComments([newComment, ...comments]);
      setCommentForm({ content: '', rating: 5 });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('提交评论失败:', error);
    }
  };
  
  // 处理复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  // 处理回复评论
  const handleReplyComment = async (parentId: string) => {
    if (!user || !id) return;
    
    const content = replyForm[parentId] || '';
    if (!content.trim()) return;
    
    try {
      await addComment(id, content, 5, parentId);
      
      const newReply: CommentType = {
        id: Date.now().toString(),
        user_id: user.id,
        tool_id: id,
        parent_id: parentId,
        content,
        rating: 5,
        likes: 0,
        created_at: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username || '',
        },
      };
      
      setComments([newReply, ...comments]);
      setReplyForm({ ...replyForm, [parentId]: '' });
      setReplyingTo(null);
    } catch (error) {
      console.error('回复评论失败:', error);
    }
  };
  
  // 处理点赞评论
  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const result = await likeComment(commentId);
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, likes: result.likes } : c
      ));
    } catch (error) {
      console.error('点赞失败:', error);
    }
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
        <h3 className="text-white font-semibold mb-2">加载失败</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Link to="/" className="btn-primary inline-block">
          返回首页
        </Link>
      </div>
    );
  }
  
  // 如果工具不存在，显示错误页面
  if (!tool) {
    return (
      <div className="page-transition pt-20 text-center py-20">
        <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-2">工具不存在</h3>
        <p className="text-gray-400 mb-4">该工具可能已被删除或不存在</p>
        <Link to="/" className="btn-primary inline-block">
          返回首页
        </Link>
      </div>
    );
  }
  
  return (
    <div className="page-transition pt-20">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-accent-500 text-white rounded-xl shadow-lg">
          操作成功！
        </div>
      )}
      
      {/* 工具头部信息 */}
      <section className="py-12 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* 工具图标和名称 */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center">
                <div 
                  dangerouslySetInnerHTML={{ __html: tool.icon }} 
                  className="w-12 h-12 text-primary-400"
                />
              </div>
              <div>
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-2">
                  {tool.name}
                </h1>
                <p className="text-gray-400">{tool.description}</p>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleFavoriteClick}
                disabled={!user}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  isFavorited 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                    : user 
                      ? 'bg-dark-700/50 text-gray-300 border border-dark-600 hover:border-primary-500/50 hover:text-primary-400'
                      : 'bg-dark-700/50 text-gray-500 border border-dark-600 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{isFavorited ? '已收藏' : '收藏'}</span>
              </button>
              <Link to="/community" className="btn-primary">
                去评论
              </Link>
            </div>
          </div>
          
          {/* 标签和统计 */}
          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <span className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm">
              {tool.category}
            </span>
            <div className="flex items-center gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{tool.usage_count?.toLocaleString() || 0} 次使用</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{tool.views_count?.toLocaleString() || 0} 次浏览</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{comments.length} 条评论</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* 工具交互界面 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-6 md:p-8">
            {/* JSON 格式化工具 */}
            {tool.id === 'json-formatter' && (
              <div>
                <h3 className="text-white font-semibold mb-4">输入 JSON 数据</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='{"name": "工具乐园", "version": "1.0", "features": ["JSON格式化", "密码生成", "Base64转换"]}'
                      className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none font-mono text-sm"
                    />
                    <button
                      onClick={handleJsonFormat}
                      className="mt-4 w-full btn-primary"
                    >
                      格式化 JSON
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-400">格式化结果</h4>
                      {jsonOutput && (
                        <button
                          onClick={() => handleCopy(jsonOutput)}
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          复制
                        </button>
                      )}
                    </div>
                    {jsonError ? (
                      <div className="w-full h-64 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center justify-center">
                        {jsonError}
                      </div>
                    ) : (
                      <pre className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white overflow-auto font-mono text-sm text-green-400">
                        {jsonOutput || '格式化结果将在这里显示'}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 密码生成器工具 */}
            {tool.id === 'password-generator' && (
              <div>
                <h3 className="text-white font-semibold mb-4">密码设置</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    {/* 密码长度 */}
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">密码长度: {passwordLength}</label>
                      <input
                        type="range"
                        min="4"
                        max="64"
                        value={passwordLength}
                        onChange={(e) => setPasswordLength(Number(e.target.value))}
                        className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>
                    
                    {/* 字符类型选项 */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={includeUppercase}
                          onChange={(e) => setIncludeUppercase(e.target.checked)}
                          className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">包含大写字母 (A-Z)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={includeLowercase}
                          onChange={(e) => setIncludeLowercase(e.target.checked)}
                          className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">包含小写字母 (a-z)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={includeNumbers}
                          onChange={(e) => setIncludeNumbers(e.target.checked)}
                          className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">包含数字 (0-9)</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={includeSymbols}
                          onChange={(e) => setIncludeSymbols(e.target.checked)}
                          className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-300">包含特殊符号 (!@#$%)</span>
                      </label>
                    </div>
                    
                    <button
                      onClick={handleGeneratePassword}
                      className="mt-6 w-full btn-primary"
                    >
                      生成密码
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-3">生成的密码</h4>
                    <div className="relative">
                      <input
                        type="text"
                        value={generatedPassword}
                        readOnly
                        className="w-full h-16 bg-dark-700/50 border border-dark-600 rounded-xl px-4 text-white font-mono text-lg focus:outline-none"
                        placeholder="点击生成按钮生成密码"
                      />
                      {generatedPassword && (
                        <button
                          onClick={() => handleCopy(generatedPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center hover:bg-primary-500/30 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* 密码强度指示 */}
                    {generatedPassword && (
                      <div className="mt-6">
                        <label className="block text-gray-400 mb-2">密码强度</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((level) => {
                            let color = 'bg-dark-600';
                            if (generatedPassword.length >= 8) color = level <= 1 ? 'bg-red-500' : color;
                            if (generatedPassword.length >= 12) color = level <= 2 ? 'bg-yellow-500' : color;
                            if (generatedPassword.length >= 16) color = level <= 3 ? 'bg-accent-500' : color;
                            if (generatedPassword.length >= 20) color = 'bg-accent-500';
                            return (
                              <div key={level} className={`flex-1 h-3 rounded-full ${color}`} />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Base64 编码/解码器工具 */}
            {tool.id === 'base64-converter' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setBase64Mode('encode')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      base64Mode === 'encode' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    编码
                  </button>
                  <button
                    onClick={() => setBase64Mode('decode')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      base64Mode === 'decode' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    解码
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">
                      {base64Mode === 'encode' ? '输入要编码的文本' : '输入要解码的 Base64'}
                    </h4>
                    <textarea
                      value={base64Input}
                      onChange={(e) => setBase64Input(e.target.value)}
                      placeholder={base64Mode === 'encode' ? '在此输入文本...' : 'dGVzdCBiYXNlNjQgZW5jb2RlZA=='}
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                    <button
                      onClick={handleBase64Convert}
                      className="mt-4 w-full btn-primary"
                    >
                      {base64Mode === 'encode' ? '编码为 Base64' : '解码 Base64'}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-400">
                        {base64Mode === 'encode' ? 'Base64 编码结果' : '解码结果'}
                      </h4>
                      {base64Output && (
                        <button
                          onClick={() => handleCopy(base64Output)}
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          复制
                        </button>
                      )}
                    </div>
                    <textarea
                      value={base64Output}
                      readOnly
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white font-mono text-sm resize-none"
                      placeholder="转换结果将在这里显示"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* 其他工具占位 */}
            {tool.id === 'color-picker' && (
              <div>
                <h3 className="text-white font-semibold mb-6">颜色选择器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="relative">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-48 rounded-xl cursor-pointer bg-transparent"
                      />
                      <div 
                        className="absolute inset-0 rounded-xl border-2 border-dark-600 pointer-events-none"
                        style={{ backgroundColor: colorHex }}
                      />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <input
                        type="color"
                        value="#3b82f6"
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="color"
                        value="#ef4444"
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="color"
                        value="#22c55e"
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="color"
                        value="#eab308"
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <span className="text-gray-400">HEX</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={colorHex}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="bg-dark-600/50 border border-dark-500 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary-500"
                        />
                        <button
                          onClick={() => handleCopy(colorHex)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <span className="text-gray-400">RGB</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={colorRgb}
                          readOnly
                          className="bg-dark-600/50 border border-dark-500 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(colorRgb)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <span className="text-gray-400">HSL</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={colorHsl}
                          readOnly
                          className="bg-dark-600/50 border border-dark-500 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(colorHsl)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                      <span className="text-gray-400">CSS</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`color: ${colorHex};`}
                          readOnly
                          className="bg-dark-600/50 border border-dark-500 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <button
                          onClick={() => handleCopy(`color: ${colorHex};`)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {tool.id === 'qr-code-generator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">二维码生成器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">输入内容</label>
                      <textarea
                        value={qrContent}
                        onChange={(e) => setQrContent(e.target.value)}
                        placeholder="输入网址、文本或其他内容..."
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                        rows={4}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">尺寸: {qrSize}x{qrSize}</label>
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={qrSize}
                        onChange={(e) => setQrSize(Number(e.target.value))}
                        className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 mb-2">前景色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="flex-1 bg-dark-700/50 border border-dark-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">背景色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="flex-1 bg-dark-700/50 border border-dark-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleGenerateQrCode}
                      className="w-full btn-primary"
                    >
                      生成二维码
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">生成的二维码</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
                      {qrImage ? (
                        <img
                          src={qrImage}
                          alt="QR Code"
                          className="rounded-lg"
                          onClick={() => handleCopy(qrImage)}
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <rect x="3" y="3" width="7" height="7"/>
                              <rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/>
                              <rect x="3" y="14" width="7" height="7"/>
                              <rect x="9" y="9" width="6" height="6"/>
                              <circle cx="12" cy="12" r="1"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">输入内容后点击生成</p>
                        </div>
                      )}
                    </div>
                    {qrImage && (
                      <div className="mt-4 flex justify-center">
                        <a
                          href={qrImage}
                          download="qrcode.png"
                          className="px-6 py-3 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-colors"
                        >
                          下载二维码
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {tool.id === 'unit-converter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">单位转换器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">数值</label>
                      <input
                        type="number"
                        value={unitValue}
                        onChange={(e) => setUnitValue(e.target.value)}
                        placeholder="输入数值"
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 mb-2">从</label>
                        <select
                          value={unitFrom}
                          onChange={(e) => setUnitFrom(e.target.value)}
                          className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          {Object.entries(unitNames).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">转换为</label>
                        <select
                          value={unitTo}
                          onChange={(e) => setUnitTo(e.target.value)}
                          className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          {Object.entries(unitNames).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleUnitConvert}
                      className="w-full btn-primary"
                    >
                      转换
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">转换结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[200px] flex items-center justify-center">
                      {unitResult ? (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white mb-2">
                            {unitValue} {unitNames[unitFrom]}
                          </div>
                          <div className="text-gray-500 mb-2">
                            =
                          </div>
                          <div className="text-4xl font-bold gradient-text">
                            {unitResult} {unitNames[unitTo]}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">输入数值后点击转换</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 时间戳转换器工具 */}
            {tool.id === 'timestamp-converter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">时间戳转换器</h3>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setTimestampMode('to-timestamp')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      timestampMode === 'to-timestamp' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    日期 → 时间戳
                  </button>
                  <button
                    onClick={() => setTimestampMode('to-time')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      timestampMode === 'to-time' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    时间戳 → 日期
                  </button>
                  <button
                    onClick={handleGetCurrentTimestamp}
                    className="px-6 py-3 rounded-xl font-medium bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-all"
                  >
                    当前时间戳
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">
                      {timestampMode === 'to-timestamp' ? '输入日期' : '输入时间戳'}
                    </h4>
                    <input
                      type="text"
                      value={timestampInput}
                      onChange={(e) => setTimestampInput(e.target.value)}
                      placeholder={timestampMode === 'to-timestamp' ? '2024-01-01 12:00:00' : '1704067200000'}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button
                      onClick={handleTimestampConvert}
                      className="mt-4 w-full btn-primary"
                    >
                      转换
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-400">结果</h4>
                      {timestampOutput && !timestampOutput.includes('无效') && (
                        <button
                          onClick={() => handleCopy(timestampOutput)}
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          复制
                        </button>
                      )}
                    </div>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 min-h-[150px] flex items-center justify-center">
                      {timestampOutput ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{timestampOutput}</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">输入后点击转换</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* URL 编码/解码器工具 */}
            {tool.id === 'url-encoder' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setUrlMode('encode')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      urlMode === 'encode' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    编码
                  </button>
                  <button
                    onClick={() => setUrlMode('decode')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      urlMode === 'decode' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-dark-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    解码
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">
                      {urlMode === 'encode' ? '输入要编码的 URL' : '输入要解码的 URL'}
                    </h4>
                    <textarea
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={urlMode === 'encode' ? 'https://example.com?name=测试' : 'https%3A%2F%2Fexample.com%3Fname%3D%E6%B5%8B%E8%AF%95'}
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                    <button
                      onClick={handleUrlConvert}
                      className="mt-4 w-full btn-primary"
                    >
                      {urlMode === 'encode' ? '编码 URL' : '解码 URL'}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-400">结果</h4>
                      {urlOutput && !urlOutput.includes('失败') && (
                        <button
                          onClick={() => handleCopy(urlOutput)}
                          className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          复制
                        </button>
                      )}
                    </div>
                    <textarea
                      value={urlOutput}
                      readOnly
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white font-mono text-sm resize-none"
                      placeholder="转换结果将在这里显示"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* 正则表达式测试器工具 */}
            {tool.id === 'regex-tester' && (
              <div>
                <h3 className="text-white font-semibold mb-6">正则表达式测试器</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-gray-400 mb-2">正则表达式</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-lg">/</span>
                        <input
                          type="text"
                          value={regexPattern}
                          onChange={(e) => setRegexPattern(e.target.value)}
                          placeholder="输入正则表达式"
                          className="flex-1 bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                        <span className="text-gray-500 text-lg">/</span>
                        <input
                          type="text"
                          value={regexFlags}
                          onChange={(e) => setRegexFlags(e.target.value)}
                          placeholder="flags"
                          className="w-20 bg-dark-700/50 border border-dark-600 rounded-xl px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors font-mono"
                        />
                      </div>
                      {regexError && (
                        <p className="text-red-400 text-sm mt-2">{regexError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">测试字符串</label>
                      <textarea
                        value={regexTestString}
                        onChange={(e) => setRegexTestString(e.target.value)}
                        placeholder="输入要测试的文本..."
                        className="w-full h-20 bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleRegexTest}
                    className="btn-primary"
                  >
                    测试匹配
                  </button>
                  <div>
                    <h4 className="text-gray-400 mb-3">匹配结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 min-h-[150px]">
                      {regexMatches.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-gray-300">找到 {regexMatches.length} 个匹配:</p>
                          {regexMatches.map((match, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-lg">
                              <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm">
                                {index + 1}
                              </span>
                              <span className="text-white font-mono">{match}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">输入正则表达式和测试字符串后点击测试</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 计算器工具 */}
            {tool.id === 'calculator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">计算器</h3>
                <div className="max-w-md mx-auto">
                  <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 mb-6">
                    <div className="text-right">
                      <div className="text-gray-400 text-sm mb-1">
                        {calculatorMemory && calculatorOperator && `${calculatorMemory} ${calculatorOperator}`}
                      </div>
                      <div className="text-4xl font-bold text-white font-mono">
                        {calculatorDisplay}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => handleCalculatorInput('C')}
                      className="h-16 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                    >
                      C
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('/')}
                      className="h-16 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-colors"
                    >
                      ÷
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('*')}
                      className="h-16 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-colors"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('-')}
                      className="h-16 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-colors"
                    >
                      −
                    </button>
                    
                    <button
                      onClick={() => handleCalculatorInput('7')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      7
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('8')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      8
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('9')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      9
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('+')}
                      className="h-16 bg-dark-600 text-gray-300 rounded-xl font-medium hover:bg-dark-500 transition-colors"
                    >
                      +
                    </button>
                    
                    <button
                      onClick={() => handleCalculatorInput('4')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      4
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('5')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      5
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('6')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      6
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('=')}
                      className="h-32 row-span-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-400 transition-colors"
                    >
                      =
                    </button>
                    
                    <button
                      onClick={() => handleCalculatorInput('1')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      1
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('2')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      2
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('3')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      3
                    </button>
                    
                    <button
                      onClick={() => handleCalculatorInput('0')}
                      className="h-16 col-span-2 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleCalculatorInput('.')}
                      className="h-16 bg-dark-700 text-white rounded-xl font-medium hover:bg-dark-600 transition-colors"
                    >
                      .
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 三国杀游戏入口 */}
            {tool.id === 'sanguosha' && (
              <div className="text-center py-12">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="9" y="9" width="6" height="6"/>
                    <circle cx="12" cy="12" r="1"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">三国杀多人联机对战</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  支持2-4人联机对战，使用Socket.IO实时通信。基本牌：杀、闪、桃。回合制策略卡牌游戏。
                </p>
                <Link 
                  to="/game" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-red-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  进入游戏大厅
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 评论区 */}
      <section className="py-12 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-6">用户评论</h2>
          
          {/* 评论表单 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="glass-card p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    placeholder="发表您的评论..."
                    className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              {/* 评分选择 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentForm({ ...commentForm, rating: star })}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= commentForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <button type="submit" className="btn-primary">
                  提交评论
                </button>
              </div>
            </form>
          ) : (
            <div className="glass-card p-6 mb-8 text-center">
              <p className="text-gray-400 mb-4">请先登录后发表评论</p>
              <div className="flex justify-center gap-4">
                <Link to="/login" className="text-primary-400 hover:text-primary-300">
                  登录
                </Link>
                <span className="text-gray-500">|</span>
                <Link to="/register" className="text-primary-400 hover:text-primary-300">
                  注册
                </Link>
              </div>
            </div>
          )}
          
          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className={`glass-card p-6 ${comment.parent_id ? 'ml-8 border-l-2 border-primary-500/50' : ''}`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {comment.user?.username?.charAt(0).toUpperCase() || comment.user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {comment.user?.username || comment.user?.email}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div className="ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < comment.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{comment.content}</p>
                  
                  {/* 评论操作栏 */}
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span>{comment.likes || 0}</span>
                    </button>
                    {user && !comment.parent_id && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>回复</span>
                      </button>
                    )}
                  </div>
                  
                  {/* 回复表单 */}
                  {replyingTo === comment.id && user && (
                    <div className="mt-4 pt-4 border-t border-dark-600">
                      <textarea
                        value={replyForm[comment.id] || ''}
                        onChange={(e) => setReplyForm({ ...replyForm, [comment.id]: e.target.value })}
                        placeholder={`回复 ${comment.user?.username || comment.user?.email}...`}
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-400 hover:text-white transition-colors px-4 py-2"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleReplyComment(comment.id)}
                          className="btn-primary"
                        >
                          回复
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无评论，快来发表第一条评论吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToolPage;
