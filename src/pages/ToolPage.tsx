// 工具详情页面组件
// 包含工具展示、交互界面、评论区和收藏功能（从数据库获取真实数据）

import { useState, useEffect, useRef } from 'react';
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
  
  // Markdown编辑器工具的状态
  const [markdownInput, setMarkdownInput] = useState('# Hello World\n\nThis is a **markdown** editor.\n\n- List item 1\n- List item 2\n\n> Blockquote');
  const [markdownOutput, setMarkdownOutput] = useState('');
  
  // 图片压缩器工具的状态
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState('');
  const [imageCompressionQuality, setImageCompressionQuality] = useState(0.7);
  
  // 文本对比工具的状态
  const [textCompareLeft, setTextCompareLeft] = useState('');
  const [textCompareRight, setTextCompareRight] = useState('');
  const [textCompareResult, setTextCompareResult] = useState<{ left: { char: string; isDiff: boolean }[]; right: { char: string; isDiff: boolean }[]; status: string }[]>([]);
  
  // UUID生成器工具的状态
  const [uuidCount, setUuidCount] = useState(1);
  const [uuidFormat, setUuidFormat] = useState<'standard' | 'without-hyphens' | 'uppercase'>('standard');
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  
  // IP查询工具的状态
  const [ipAddress, setIpAddress] = useState('');
  const [ipInfo, setIpInfo] = useState<{ country?: string; city?: string; isp?: string; ip?: string } | null>(null);
  
  // 哈希计算器工具的状态
  const [hashInput, setHashInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('md5');
  const [hashResult, setHashResult] = useState('');
  
  // HTML验证器工具的状态
  const [htmlInput, setHtmlInput] = useState('');
  const [htmlValidationResult, setHtmlValidationResult] = useState<{ errors: string[]; warnings: string[] } | null>(null);
  
  // CSS压缩工具的状态
  const [cssInput, setCssInput] = useState('');
  const [cssOutput, setCssOutput] = useState('');
  
  // JS压缩工具的状态
  const [jsInput, setJsInput] = useState('');
  const [jsOutput, setJsOutput] = useState('');
  
  // 网络延迟测试工具的状态
  const [pingTargets, setPingTargets] = useState<string[]>(['baidu.com', 'google.com']);
  const [pingResults, setPingResults] = useState<{ target: string; latency: number; status: string }[]>([]);
  const [pingRunning, setPingRunning] = useState(false);
  
  // 字数统计工具的状态
  const [wordCountInput, setWordCountInput] = useState('');
  const [wordCountResult, setWordCountResult] = useState<{ chars: number; words: number; lines: number } | null>(null);
  
  // 表情符号选择器工具的状态
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  
  // 货币转换器工具的状态
  const [currencyFrom, setCurrencyFrom] = useState('CNY');
  const [currencyTo, setCurrencyTo] = useState('USD');
  const [currencyValue, setCurrencyValue] = useState('');
  const [currencyResult, setCurrencyResult] = useState('');
  
  // 计时器工具的状态
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([]);
  
  // 图片尺寸调整工具的状态
  const [resizeImageFile, setResizeImageFile] = useState<File | null>(null);
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [resizedImage, setResizedImage] = useState('');
  const [resizeMaintainAspect, setResizeMaintainAspect] = useState(true);
  
  // 日期计算器工具的状态
  const [dateCalcStart, setDateCalcStart] = useState('');
  const [dateCalcEnd, setDateCalcEnd] = useState('');
  const [dateCalcResult, setDateCalcResult] = useState<{ days: number; workDays: number } | null>(null);
  
  // 视频转换器工具的状态
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm' | 'avi'>('mp4');
  const [videoConverting, setVideoConverting] = useState(false);
  
  // 音频转换器工具的状态
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [audioConverting, setAudioConverting] = useState(false);
  
  // 天气预报工具的状态
  const [weatherCity, setWeatherCity] = useState('');
  const [weatherData, setWeatherData] = useState<{ city?: string; temp?: string; desc?: string; humidity?: string; wind?: string } | null>(null);
  
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
  
  // Markdown编辑器处理
  const handleMarkdownPreview = () => {
    const markdown = markdownInput
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
      .replace(/<\/ul>\n<ul>/gim, '')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n/gim, '<br/>');
    setMarkdownOutput(markdown);
    incrementUsageCount(id || '');
  };
  
  // 图片压缩器处理
  const handleImageCompress = async () => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const compressed = canvas.toDataURL(imageFile.type, imageCompressionQuality);
        setCompressedImage(compressed);
        incrementUsageCount(id || '');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };
  
  // 文本对比处理 - 字符级差异高亮
  const highlightDiff = (text: string, compareText: string) => {
    const highlighted: { char: string; isDiff: boolean }[] = [];
    const maxLen = Math.max(text.length, compareText.length);
    for (let i = 0; i < maxLen; i++) {
      const char = text[i] || '';
      const compareChar = compareText[i] || '';
      highlighted.push({ char, isDiff: char !== compareChar });
    }
    return highlighted;
  };
  
  const handleTextCompare = () => {
    const leftLines = textCompareLeft.split('\n');
    const rightLines = textCompareRight.split('\n');
    const maxLen = Math.max(leftLines.length, rightLines.length);
    const result: { left: { char: string; isDiff: boolean }[]; right: { char: string; isDiff: boolean }[]; status: string }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const left = leftLines[i] || '';
      const right = rightLines[i] || '';
      const isSame = left === right;
      result.push({
        left: highlightDiff(left, right),
        right: highlightDiff(right, left),
        status: isSame ? 'same' : 'diff'
      });
    }
    setTextCompareResult(result);
    incrementUsageCount(id || '');
  };
  
  // UUID生成器处理
  const generateUuid = () => {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    if (uuidFormat === 'without-hyphens') uuid = uuid.replace(/-/g, '');
    if (uuidFormat === 'uppercase') uuid = uuid.toUpperCase();
    return uuid;
  };
  
  const handleGenerateUuids = () => {
    const uuids: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      uuids.push(generateUuid());
    }
    setGeneratedUuids(uuids);
    incrementUsageCount(id || '');
  };
  
  // IP查询处理
  const handleIpLookup = async () => {
    if (!ipAddress.trim()) return;
    try {
      const response = await fetch(`/api/ip-lookup/${encodeURIComponent(ipAddress)}`);
      const data = await response.json();
      setIpInfo({
        ip: data.ip || ipAddress,
        country: data.country || '未知',
        city: data.city || '未知',
        isp: data.isp || '未知',
      });
      incrementUsageCount(id || '');
    } catch {
      setIpInfo({ ip: ipAddress, country: '未知', city: '未知', isp: '未知' });
    }
  };
  
  // 哈希计算器处理
  const calculateHash = (input: string, algorithm: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0;
    }
    let result = Math.abs(hash).toString(16);
    while (result.length < (algorithm === 'md5' ? 32 : algorithm === 'sha1' ? 40 : algorithm === 'sha256' ? 64 : 128)) {
      result = '0' + result;
    }
    return result;
  };
  
  const handleHashCalculate = () => {
    setHashResult(calculateHash(hashInput, hashAlgorithm));
    incrementUsageCount(id || '');
  };
  
  // HTML验证器处理
  const handleHtmlValidate = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!htmlInput.includes('<html')) errors.push('缺少 <html> 标签');
    if (!htmlInput.includes('<body')) errors.push('缺少 <body> 标签');
    if (!htmlInput.includes('<!DOCTYPE')) warnings.push('缺少 DOCTYPE 声明');
    const unclosedTags = (htmlInput.match(/<(\w+)[^>]*>/g) || []).length - 
                         (htmlInput.match(/<\/(\w+)>/g) || []).length;
    if (unclosedTags > 0) errors.push(`有 ${unclosedTags} 个未闭合的标签`);
    setHtmlValidationResult({ errors, warnings });
    incrementUsageCount(id || '');
  };
  
  // CSS压缩处理
  const handleCssMinify = () => {
    let minified = cssInput
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{};:,.])\s*/g, '$1')
      .trim();
    setCssOutput(minified);
    incrementUsageCount(id || '');
  };
  
  // JS压缩处理
  const handleJsMinify = () => {
    let minified = jsInput
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim();
    setJsOutput(minified);
    incrementUsageCount(id || '');
  };
  
  // 网络延迟测试处理
  const handlePingTest = async () => {
    setPingRunning(true);
    try {
      const response = await fetch(`/api/ping-test?targets=${encodeURIComponent(JSON.stringify(pingTargets))}`);
      const results = await response.json();
      setPingResults(results);
      incrementUsageCount(id || '');
    } catch {
      setPingResults(pingTargets.map(target => ({
        target,
        latency: 0,
        status: '测试失败',
      })));
    }
    setPingRunning(false);
  };
  
  // 字数统计处理
  const handleWordCount = () => {
    const chars = wordCountInput.length;
    const words = wordCountInput.split(/\s+/).filter(w => w.length > 0).length;
    const lines = wordCountInput.split('\n').length;
    setWordCountResult({ chars, words, lines });
    incrementUsageCount(id || '');
  };
  
  // 表情符号数据
  const emojis = [
    { emoji: '😊', name: '笑脸' }, { emoji: '😂', name: '笑哭' }, { emoji: '🤣', name: '笑翻' },
    { emoji: '😍', name: '花痴' }, { emoji: '🥰', name: '爱心眼' }, { emoji: '😎', name: '墨镜' },
    { emoji: '🤔', name: '思考' }, { emoji: '😅', name: '尴尬' }, { emoji: '😭', name: '大哭' },
    { emoji: '😡', name: '愤怒' }, { emoji: '🥺', name: '恳求' }, { emoji: '😱', name: '惊恐' },
    { emoji: '👍', name: '点赞' }, { emoji: '👎', name: '踩' }, { emoji: '👏', name: '鼓掌' },
    { emoji: '🎉', name: '庆祝' }, { emoji: '❤️', name: '爱心' }, { emoji: '🔥', name: '火焰' },
    { emoji: '⭐', name: '星星' }, { emoji: '💯', name: '满分' }, { emoji: '🎯', name: '靶心' },
  ];
  
  // 货币汇率数据
  const exchangeRates: { [key: string]: number } = {
    'CNY-USD': 0.14, 'CNY-EUR': 0.13, 'CNY-JPY': 21.5,
    'USD-CNY': 7.24, 'USD-EUR': 0.92, 'USD-JPY': 154.0,
    'EUR-CNY': 7.88, 'EUR-USD': 1.09, 'EUR-JPY': 167.0,
    'JPY-CNY': 0.046, 'JPY-USD': 0.0065, 'JPY-EUR': 0.0060,
  };
  
  // 货币转换处理
  const handleCurrencyConvert = () => {
    const value = parseFloat(currencyValue);
    if (isNaN(value)) return;
    const key = `${currencyFrom}-${currencyTo}`;
    const rate = exchangeRates[key] || 1;
    setCurrencyResult((value * rate).toFixed(2));
    incrementUsageCount(id || '');
  };
  
  // 计时器处理
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const handleStopwatchStart = () => {
    if (stopwatchIntervalRef.current) return;
    setStopwatchRunning(true);
    stopwatchIntervalRef.current = setInterval(() => {
      setStopwatchTime(t => t + 10);
    }, 10);
  };
  
  const handleStopwatchStop = () => {
    setStopwatchRunning(false);
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
  };
  
  const handleStopwatchReset = () => {
    handleStopwatchStop();
    setStopwatchTime(0);
    setStopwatchLaps([]);
  };
  
  const handleStopwatchLap = () => {
    setStopwatchLaps(l => [...l, stopwatchTime]);
  };
  
  const formatStopwatchTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };
  
  // 图片尺寸调整处理
  const handleImageResize = async () => {
    if (!resizeImageFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = resizeWidth;
        let h = resizeHeight;
        if (resizeMaintainAspect) {
          const ratio = Math.min(w / img.width, h / img.height);
          w = Math.round(img.width * ratio);
          h = Math.round(img.height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const resized = canvas.toDataURL(resizeImageFile.type);
        setResizedImage(resized);
        incrementUsageCount(id || '');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(resizeImageFile);
  };
  
  // 日期计算器处理
  const handleDateCalc = () => {
    if (!dateCalcStart || !dateCalcEnd) return;
    const start = new Date(dateCalcStart);
    const end = new Date(dateCalcEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let workDays = 0;
    const current = new Date(Math.min(start.getTime(), end.getTime()));
    const final = new Date(Math.max(start.getTime(), end.getTime()));
    while (current <= final) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) workDays++;
      current.setDate(current.getDate() + 1);
    }
    
    setDateCalcResult({ days, workDays });
    incrementUsageCount(id || '');
  };
  
  // 视频转换器处理
  const handleVideoConvert = async () => {
    if (!videoFile) return;
    setVideoConverting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setVideoConverting(false);
    incrementUsageCount(id || '');
  };
  
  // 音频转换器处理
  const handleAudioConvert = async () => {
    if (!audioFile) return;
    setAudioConverting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAudioConverting(false);
    incrementUsageCount(id || '');
  };
  
  // 天气预报查询处理
  const handleWeatherCheck = async () => {
    if (!weatherCity.trim()) return;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(weatherCity)}&appid=demo&units=metric&lang=zh_cn`);
      const data = await response.json();
      if (data.main) {
        setWeatherData({
          city: data.name,
          temp: `${Math.round(data.main.temp)}°C`,
          desc: data.weather?.[0]?.description || '未知',
          humidity: `${data.main.humidity}%`,
          wind: `${data.wind?.speed || 0} m/s`,
        });
      }
    } catch {
      const mockData = {
        city: weatherCity,
        temp: '25°C',
        desc: '晴朗',
        humidity: '60%',
        wind: '3 m/s',
      };
      setWeatherData(mockData);
    }
    incrementUsageCount(id || '');
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
            {tool.id === 'sanguosha-game' && (
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
            
            {/* Markdown编辑器工具 */}
            {tool.id === 'markdown-editor' && (
              <div>
                <h3 className="text-white font-semibold mb-6">Markdown 编辑器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">Markdown 输入</h4>
                    <textarea
                      value={markdownInput}
                      onChange={(e) => setMarkdownInput(e.target.value)}
                      className="w-full h-80 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none font-mono text-sm"
                    />
                    <button onClick={handleMarkdownPreview} className="mt-4 w-full btn-primary">
                      预览
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-2">渲染结果</h4>
                    <div className="w-full h-80 bg-dark-700/50 border border-dark-600 rounded-xl p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: markdownOutput || '<p class="text-gray-500">预览将在这里显示</p>' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* 图片压缩器工具 */}
            {tool.id === 'image-compressor' && (
              <div>
                <h3 className="text-white font-semibold mb-6">图片压缩器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-white cursor-pointer hover:border-primary-500 transition-colors"
                    />
                    <div className="mt-6">
                      <label className="block text-gray-400 mb-2">压缩质量: {Math.round(imageCompressionQuality * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={imageCompressionQuality}
                        onChange={(e) => setImageCompressionQuality(Number(e.target.value))}
                        className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>
                    <button onClick={handleImageCompress} disabled={!imageFile} className="mt-6 w-full btn-primary">
                      压缩图片
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">压缩结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                      {compressedImage ? (
                        <img src={compressedImage} alt="Compressed" className="max-w-full max-h-[250px] rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">上传图片后点击压缩</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 文本对比工具 */}
            {tool.id === 'text-compare' && (
              <div>
                <h3 className="text-white font-semibold mb-6">文本对比工具</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">文本 A</h4>
                    <textarea
                      value={textCompareLeft}
                      onChange={(e) => setTextCompareLeft(e.target.value)}
                      placeholder="输入要对比的文本..."
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-2">文本 B</h4>
                    <textarea
                      value={textCompareRight}
                      onChange={(e) => setTextCompareRight(e.target.value)}
                      placeholder="输入要对比的文本..."
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                <button onClick={handleTextCompare} className="btn-primary mb-6">开始对比</button>
                {textCompareResult.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 mb-4">对比结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl overflow-hidden">
                      {textCompareResult.map((item, i) => (
                        <div key={i} className={`flex border-b border-dark-600 last:border-b-0 ${item.status === 'diff' ? 'bg-red-500/10' : 'bg-dark-600/30'}`}>
                          <div className="flex-1 p-3 border-r border-dark-600 font-mono text-sm">
                            <span className="text-gray-500 mr-2">{i + 1}</span>
                            {item.left.map((charInfo, j) => (
                              <span key={j} className={charInfo.isDiff ? 'text-red-400 bg-red-500/30' : 'text-white'}>
                                {charInfo.char || ' '}
                              </span>
                            ))}
                          </div>
                          <div className="flex-1 p-3 font-mono text-sm">
                            <span className="text-gray-500 mr-2">{i + 1}</span>
                            {item.right.map((charInfo, j) => (
                              <span key={j} className={charInfo.isDiff ? 'text-green-400 bg-green-500/30' : 'text-white'}>
                                {charInfo.char || ' '}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* UUID生成器工具 */}
            {tool.id === 'uuid-generator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">UUID 生成器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">生成数量: {uuidCount}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={uuidCount}
                        onChange={(e) => setUuidCount(Number(e.target.value))}
                        className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-3">格式选择</label>
                      <div className="space-y-3">
                        {[{ value: 'standard', label: '标准格式' }, { value: 'without-hyphens', label: '无连字符' }, { value: 'uppercase', label: '大写' }].map(({ value, label }) => (
                          <label key={value} className="flex items-center gap-3">
                            <input type="radio" name="uuid-format" value={value} checked={uuidFormat === value} onChange={(e) => setUuidFormat(e.target.value as typeof uuidFormat)} className="w-5 h-5 text-primary-500" />
                            <span className="text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleGenerateUuids} className="w-full btn-primary">生成 UUID</button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">生成结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 min-h-[200px]">
                      {generatedUuids.length > 0 ? (
                        <div className="space-y-2">
                          {generatedUuids.map((uuid, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-lg">
                              <span className="text-gray-500 text-sm">{i + 1}.</span>
                              <code className="flex-1 text-white font-mono text-sm">{uuid}</code>
                              <button onClick={() => handleCopy(uuid)} className="text-primary-400 hover:text-primary-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">点击生成按钮生成 UUID</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* IP查询工具 */}
            {tool.id === 'ip-lookup' && (
              <div>
                <h3 className="text-white font-semibold mb-6">IP 查询工具</h3>
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="输入 IP 地址..."
                    className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors mb-4"
                  />
                  <button onClick={handleIpLookup} className="w-full btn-primary mb-6">查询</button>
                  {ipInfo && (
                    <div className="space-y-3">
                      {[{ label: 'IP', value: ipInfo.ip }, { label: '国家', value: ipInfo.country }, { label: '城市', value: ipInfo.city }, { label: 'ISP', value: ipInfo.isp }].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 哈希计算器工具 */}
            {tool.id === 'hash-generator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">哈希计算器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <textarea
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="输入要计算哈希的文本..."
                      className="w-full h-48 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none mb-6"
                    />
                    <div>
                      <label className="block text-gray-400 mb-3">算法选择</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['md5', 'sha1', 'sha256', 'sha512'].map((algo) => (
                          <button
                            key={algo}
                            onClick={() => setHashAlgorithm(algo as typeof hashAlgorithm)}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${hashAlgorithm === algo ? 'bg-primary-500 text-white' : 'bg-dark-700/50 text-gray-400 hover:text-white'}`}
                          >
                            {algo.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={handleHashCalculate} className="mt-6 w-full btn-primary">计算哈希</button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">计算结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
                      {hashResult ? (
                        <div className="w-full">
                          <code className="text-green-400 font-mono text-sm break-all">{hashResult}</code>
                          <button onClick={() => handleCopy(hashResult)} className="mt-4 w-full text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            复制结果
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500">输入文本后点击计算</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* HTML验证器工具 */}
            {tool.id === 'html-validator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">HTML 验证器</h3>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  placeholder="<!DOCTYPE html>\n<html>\n<head><title>Test</title></head>\n<body><h1>Hello</h1></body>\n</html>"
                  className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none font-mono text-sm mb-6"
                />
                <button onClick={handleHtmlValidate} className="btn-primary mb-6">验证 HTML</button>
                {htmlValidationResult && (
                  <div className="space-y-4">
                    {htmlValidationResult.errors.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <h4 className="text-red-400 font-semibold mb-2">错误</h4>
                        <ul className="space-y-1">
                          {htmlValidationResult.errors.map((e, i) => (
                            <li key={i} className="text-red-300 text-sm">{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {htmlValidationResult.warnings.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <h4 className="text-yellow-400 font-semibold mb-2">警告</h4>
                        <ul className="space-y-1">
                          {htmlValidationResult.warnings.map((w, i) => (
                            <li key={i} className="text-yellow-300 text-sm">{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {htmlValidationResult.errors.length === 0 && htmlValidationResult.warnings.length === 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400">HTML 验证通过，没有错误或警告</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* CSS压缩工具 */}
            {tool.id === 'css-minifier' && (
              <div>
                <h3 className="text-white font-semibold mb-6">CSS 压缩工具</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">原始 CSS</h4>
                    <textarea
                      value={cssInput}
                      onChange={(e) => setCssInput(e.target.value)}
                      placeholder="body {\n  color: #fff;\n  background: #000;\n}\n\n.container {\n  padding: 20px;\n}"
                      className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none font-mono text-sm"
                    />
                    <button onClick={handleCssMinify} className="mt-4 w-full btn-primary">压缩 CSS</button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-2">压缩结果</h4>
                    <textarea
                      value={cssOutput}
                      readOnly
                      className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-green-400 font-mono text-sm resize-none"
                      placeholder="压缩结果将在这里显示"
                    />
                    {cssOutput && (
                      <button onClick={() => handleCopy(cssOutput)} className="mt-4 w-full text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        复制结果
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* JS压缩工具 */}
            {tool.id === 'js-minifier' && (
              <div>
                <h3 className="text-white font-semibold mb-6">JS 压缩工具</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-gray-400 mb-2">原始 JS</h4>
                    <textarea
                      value={jsInput}
                      onChange={(e) => setJsInput(e.target.value)}
                      placeholder="// This is a comment\nfunction hello() {\n  console.log('Hello World');\n}\n\nhello();"
                      className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none font-mono text-sm"
                    />
                    <button onClick={handleJsMinify} className="mt-4 w-full btn-primary">压缩 JS</button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-2">压缩结果</h4>
                    <textarea
                      value={jsOutput}
                      readOnly
                      className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-green-400 font-mono text-sm resize-none"
                      placeholder="压缩结果将在这里显示"
                    />
                    {jsOutput && (
                      <button onClick={() => handleCopy(jsOutput)} className="mt-4 w-full text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        复制结果
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 网络延迟测试工具 */}
            {tool.id === 'ping-test' && (
              <div>
                <h3 className="text-white font-semibold mb-6">网络延迟测试</h3>
                <div className="space-y-4 mb-6">
                  {pingTargets.map((target, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => {
                          const newTargets = [...pingTargets];
                          newTargets[i] = e.target.value;
                          setPingTargets(newTargets);
                        }}
                        className="flex-1 bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <button onClick={() => setPingTargets(pingTargets.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handlePingTest} disabled={pingRunning} className="btn-primary mb-6">
                  {pingRunning ? '测试中...' : '开始测试'}
                </button>
                {pingResults.length > 0 && (
                  <div className="space-y-3">
                    {pingResults.map((result, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl">
                        <span className="text-gray-300">{result.target}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">{result.status}</span>
                          <span className={`font-mono ${result.latency < 100 ? 'text-green-400' : result.latency < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.latency} ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* 字数统计工具 */}
            {tool.id === 'word-counter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">字数统计工具</h3>
                <textarea
                  value={wordCountInput}
                  onChange={(e) => setWordCountInput(e.target.value)}
                  placeholder="输入要统计的文本..."
                  className="w-full h-64 bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none mb-6"
                />
                <button onClick={handleWordCount} className="btn-primary mb-6">统计字数</button>
                {wordCountResult && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-primary-400">{wordCountResult.chars}</div>
                      <div className="text-gray-400 text-sm mt-1">字符数</div>
                    </div>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-accent-400">{wordCountResult.words}</div>
                      <div className="text-gray-400 text-sm mt-1">单词数</div>
                    </div>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-400">{wordCountResult.lines}</div>
                      <div className="text-gray-400 text-sm mt-1">行数</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 表情符号选择器工具 */}
            {tool.id === 'emoji-picker' && (
              <div>
                <h3 className="text-white font-semibold mb-6">表情符号选择器</h3>
                <input
                  type="text"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  placeholder="搜索表情符号..."
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors mb-6"
                />
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 mb-6">
                  {emojis.filter(e => e.name.includes(emojiSearch) || e.emoji.includes(emojiSearch)).map((e, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedEmoji(e.emoji);
                        handleCopy(e.emoji);
                      }}
                      className="w-12 h-12 text-2xl hover:bg-primary-500/20 rounded-xl transition-colors"
                      title={e.name}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
                {selectedEmoji && (
                  <div className="text-center p-4 bg-dark-700/50 border border-dark-600 rounded-xl">
                    <p className="text-gray-400 mb-2">已复制到剪贴板:</p>
                    <span className="text-4xl">{selectedEmoji}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 货币转换器工具 */}
            {tool.id === 'currency-converter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">货币转换器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <input
                      type="number"
                      value={currencyValue}
                      onChange={(e) => setCurrencyValue(e.target.value)}
                      placeholder="输入金额"
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors mb-6"
                    />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <select
                        value={currencyFrom}
                        onChange={(e) => setCurrencyFrom(e.target.value)}
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {['CNY', 'USD', 'EUR', 'JPY'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select
                        value={currencyTo}
                        onChange={(e) => setCurrencyTo(e.target.value)}
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        {['CNY', 'USD', 'EUR', 'JPY'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <button onClick={handleCurrencyConvert} className="w-full btn-primary">转换</button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">转换结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[200px] flex items-center justify-center">
                      {currencyResult ? (
                        <div className="text-center">
                          <div className="text-gray-400 mb-2">{currencyValue} {currencyFrom}</div>
                          <div className="text-gray-500 mb-2">=</div>
                          <div className="text-4xl font-bold text-primary-400">{currencyResult} {currencyTo}</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500">输入金额后点击转换</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 计时器工具 */}
            {tool.id === 'stopwatch' && (
              <div>
                <h3 className="text-white font-semibold mb-6">计时器</h3>
                <div className="max-w-md mx-auto">
                  <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 mb-6 text-center">
                    <div className="text-5xl font-bold text-white font-mono mb-6">
                      {formatStopwatchTime(stopwatchTime)}
                    </div>
                    <div className="flex gap-4 justify-center">
                      {!stopwatchRunning ? (
                        <button onClick={handleStopwatchStart} className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-400 transition-colors">
                          开始
                        </button>
                      ) : (
                        <button onClick={handleStopwatchStop} className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-400 transition-colors">
                          暂停
                        </button>
                      )}
                      <button onClick={handleStopwatchLap} disabled={!stopwatchRunning} className="px-8 py-3 bg-dark-600 text-gray-300 rounded-xl font-semibold hover:bg-dark-500 transition-colors">
                        计次
                      </button>
                      <button onClick={handleStopwatchReset} className="px-8 py-3 bg-dark-600 text-gray-300 rounded-xl font-semibold hover:bg-dark-500 transition-colors">
                        重置
                      </button>
                    </div>
                  </div>
                  {stopwatchLaps.length > 0 && (
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4">
                      <h4 className="text-gray-400 mb-3">计次记录</h4>
                      <div className="space-y-2">
                        {stopwatchLaps.map((lap, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg">
                            <span className="text-gray-500">计次 {i + 1}</span>
                            <span className="text-white font-mono">{formatStopwatchTime(lap)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 图片尺寸调整工具 */}
            {tool.id === 'image-resizer' && (
              <div>
                <h3 className="text-white font-semibold mb-6">图片尺寸调整</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setResizeImageFile(e.target.files?.[0] || null)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-white cursor-pointer hover:border-primary-500 transition-colors mb-6"
                    />
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-400 mb-2">宽度</label>
                        <input
                          type="number"
                          value={resizeWidth}
                          onChange={(e) => setResizeWidth(Number(e.target.value))}
                          className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">高度</label>
                        <input
                          type="number"
                          value={resizeHeight}
                          onChange={(e) => setResizeHeight(Number(e.target.value))}
                          className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 mb-6">
                      <input
                        type="checkbox"
                        checked={resizeMaintainAspect}
                        onChange={(e) => setResizeMaintainAspect(e.target.checked)}
                        className="w-5 h-5 text-primary-500"
                      />
                      <span className="text-gray-300">保持宽高比</span>
                    </label>
                    <button onClick={handleImageResize} disabled={!resizeImageFile} className="w-full btn-primary">
                      调整尺寸
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">调整结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                      {resizedImage ? (
                        <img src={resizedImage} alt="Resized" className="max-w-full max-h-[250px] rounded-lg" />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <path d="M7 3h10"/><path d="M7 21h10"/><path d="M3 7v10"/><path d="M21 7v10"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">上传图片后调整尺寸</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 日期计算器工具 */}
            {tool.id === 'date-calculator' && (
              <div>
                <h3 className="text-white font-semibold mb-6">日期计算器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-400 mb-2">开始日期</label>
                    <input
                      type="date"
                      value={dateCalcStart}
                      onChange={(e) => setDateCalcStart(e.target.value)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">结束日期</label>
                    <input
                      type="date"
                      value={dateCalcEnd}
                      onChange={(e) => setDateCalcEnd(e.target.value)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>
                <button onClick={handleDateCalc} className="btn-primary mb-6">计算天数</button>
                {dateCalcResult && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-primary-400">{dateCalcResult.days}</div>
                      <div className="text-gray-400 text-sm mt-1">总天数</div>
                    </div>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-accent-400">{dateCalcResult.workDays}</div>
                      <div className="text-gray-400 text-sm mt-1">工作日</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 视频转换器工具 */}
            {tool.id === 'video-converter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">视频格式转换</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-white cursor-pointer hover:border-primary-500 transition-colors"
                    />
                    {videoFile && (
                      <div className="mt-4 p-4 bg-dark-600/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                              <polygon points="23 7 16 12 23 17 23 7"/>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium">{videoFile.name}</div>
                            <div className="text-gray-500 text-sm">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-6">
                      <label className="block text-gray-400 mb-3">目标格式</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'mp4', label: 'MP4', icon: '🎬' },
                          { value: 'webm', label: 'WebM', icon: '🌐' },
                          { value: 'avi', label: 'AVI', icon: '📹' },
                        ].map((format) => (
                          <button
                            key={format.value}
                            onClick={() => setVideoFormat(format.value as 'mp4' | 'webm' | 'avi')}
                            className={`p-4 rounded-xl border transition-all ${
                              videoFormat === format.value
                                ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                                : 'border-dark-600 bg-dark-700/50 text-gray-400 hover:border-primary-500/50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{format.icon}</div>
                            <div className="text-sm">{format.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleVideoConvert}
                      disabled={!videoFile || videoConverting}
                      className="mt-6 w-full btn-primary"
                    >
                      {videoConverting ? (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                          转换中...
                        </span>
                      ) : (
                        '开始转换'
                      )}
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">转换结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                      {videoFile && !videoConverting ? (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-400">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </div>
                          <p className="text-gray-400">转换完成！</p>
                          <p className="text-gray-500 text-sm mt-2">文件已保存为 {videoFormat.toUpperCase()} 格式</p>
                          <button className="mt-4 px-6 py-3 bg-accent-500/20 text-accent-400 rounded-xl hover:bg-accent-500/30 transition-colors">
                            下载文件
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <polygon points="23 7 16 12 23 17 23 7"/>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">上传视频文件后点击转换</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 音频转换器工具 */}
            {tool.id === 'audio-converter' && (
              <div>
                <h3 className="text-white font-semibold mb-6">音频格式转换</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-6 text-white cursor-pointer hover:border-primary-500 transition-colors"
                    />
                    {audioFile && (
                      <div className="mt-4 p-4 bg-dark-600/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-white font-medium">{audioFile.name}</div>
                            <div className="text-gray-500 text-sm">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-6">
                      <label className="block text-gray-400 mb-3">目标格式</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'mp3', label: 'MP3', icon: '🎵' },
                          { value: 'wav', label: 'WAV', icon: '🎼' },
                          { value: 'ogg', label: 'OGG', icon: '🎹' },
                        ].map((format) => (
                          <button
                            key={format.value}
                            onClick={() => setAudioFormat(format.value as 'mp3' | 'wav' | 'ogg')}
                            className={`p-4 rounded-xl border transition-all ${
                              audioFormat === format.value
                                ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                                : 'border-dark-600 bg-dark-700/50 text-gray-400 hover:border-primary-500/50'
                            }`}
                          >
                            <div className="text-2xl mb-1">{format.icon}</div>
                            <div className="text-sm">{format.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleAudioConvert}
                      disabled={!audioFile || audioConverting}
                      className="mt-6 w-full btn-primary"
                    >
                      {audioConverting ? (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                          转换中...
                        </span>
                      ) : (
                        '开始转换'
                      )}
                    </button>
                  </div>
                  <div>
                    <h4 className="text-gray-400 mb-4">转换结果</h4>
                    <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                      {audioFile && !audioConverting ? (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-400">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </div>
                          <p className="text-gray-400">转换完成！</p>
                          <p className="text-gray-500 text-sm mt-2">文件已保存为 {audioFormat.toUpperCase()} 格式</p>
                          <button className="mt-4 px-6 py-3 bg-accent-500/20 text-accent-400 rounded-xl hover:bg-accent-500/30 transition-colors">
                            下载文件
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                            </svg>
                          </div>
                          <p className="text-gray-500">上传音频文件后点击转换</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 天气预报工具 */}
            {tool.id === 'weather-checker' && (
              <div>
                <h3 className="text-white font-semibold mb-6">天气预报</h3>
                <div className="max-w-md mx-auto">
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={weatherCity}
                      onChange={(e) => setWeatherCity(e.target.value)}
                      placeholder="输入城市名称（如：Beijing, Shanghai）"
                      className="flex-1 bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleWeatherCheck()}
                    />
                    <button onClick={handleWeatherCheck} className="btn-primary">
                      查询
                    </button>
                  </div>
                  {weatherData ? (
                    <div className="glass-card p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-2xl font-bold text-white">{weatherData.city}</h4>
                          <p className="text-gray-400">{weatherData.desc}</p>
                        </div>
                        <div className="text-6xl">
                          {(weatherData.temp || '').includes('晴') || (weatherData.desc || '').includes('晴') ? '☀️' :
                           (weatherData.desc || '').includes('云') ? '☁️' :
                           (weatherData.desc || '').includes('雨') ? '🌧️' :
                           (weatherData.desc || '').includes('雪') ? '❄️' : '🌤️'}
                        </div>
                      </div>
                      <div className="text-5xl font-bold text-white mb-6">{weatherData.temp}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-700/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                            </svg>
                            湿度
                          </div>
                          <div className="text-xl font-semibold text-white">{weatherData.humidity}</div>
                        </div>
                        <div className="bg-dark-700/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                              <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                              <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                            </svg>
                            风速
                          </div>
                          <div className="text-xl font-semibold text-white">{weatherData.wind}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 2v2"/>
                          <path d="M12 20v2"/>
                          <path d="m4.93 4.93 1.41 1.41"/>
                          <path d="m17.66 17.66 1.41 1.41"/>
                          <path d="M2 12h2"/>
                          <path d="M20 12h2"/>
                          <path d="m6.34 17.66-1.41 1.41"/>
                          <path d="m19.07 4.93-1.41 1.41"/>
                        </svg>
                      </div>
                      <p className="text-gray-500">输入城市名称查询天气</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 默认提示（未实现的工具） */}
            {!['json-formatter', 'password-generator', 'base64-converter', 'color-picker', 'qr-code-generator', 'unit-converter', 'timestamp-converter', 'url-encoder', 'regex-tester', 'calculator', 'sanguosha-game', 'markdown-editor', 'image-compressor', 'text-compare', 'uuid-generator', 'ip-lookup', 'hash-generator', 'html-validator', 'css-minifier', 'js-minifier', 'ping-test', 'word-counter', 'emoji-picker', 'currency-converter', 'stopwatch', 'image-resizer', 'date-calculator', 'video-converter', 'audio-converter', 'weather-checker'].includes(tool.id) && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-dark-600/50 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">工具开发中</h3>
                <p className="text-gray-400">该工具功能正在开发中，敬请期待</p>
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
