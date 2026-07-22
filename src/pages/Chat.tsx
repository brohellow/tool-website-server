import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getChatMessages, sendChatMessage } from '../utils/api';
import { ChatMessage } from '../types';
import { formatDateTime } from '../utils/date';
import { io } from 'socket.io-client';

const Chat = () => {
  const { user } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shouldScroll, setShouldScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getChatMessages();
        setMessages(data || []);
      } catch (err) {
        console.error('获取聊天消息失败:', err);
        setError('获取聊天消息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldScroll]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShouldScroll(scrollHeight - scrollTop - clientHeight < 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
    });

    socket.on('chat message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO连接错误:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO连接断开');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      await sendChatMessage(inputValue.trim());
      setInputValue('');
    } catch (err) {
      console.error('发送消息失败:', err);
      setError('发送消息失败，请稍后重试');
    }
  };

  const isOwnMessage = (message: ChatMessage) => {
    return user?.id === message.user_id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-8">
        <div className="bg-dark-700/50 backdrop-blur-sm rounded-2xl border border-dark-600 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 px-6 py-4 border-b border-dark-600">
            <h1 className="text-2xl font-bold text-white">聊天室</h1>
            <p className="text-gray-400 text-sm mt-1">与其他用户实时交流</p>
          </div>

          <div ref={chatContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-400">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>还没有消息，快来发送第一条消息吧！</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      isOwnMessage(message)
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-dark-600 text-gray-100 rounded-2xl rounded-bl-md'
                    } p-4 shadow-lg`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-semibold text-sm ${isOwnMessage(message) ? 'text-primary-200' : 'text-primary-400'}`}>
                        {message.user?.username || '匿名用户'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-dark-600 p-4 bg-dark-700/30">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                disabled={!user}
              />
              <button
                type="submit"
                disabled={!user || !inputValue.trim()}
                className="bg-primary-600 hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                发送
              </button>
            </form>
            {!user && (
              <p className="text-center text-gray-500 text-sm mt-2">请先登录才能发送消息</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
