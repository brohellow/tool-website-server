import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  getChatMessages,
  sendChatMessage,
  getPrivateMessages,
  sendPrivateMessage,
  getConversations,
} from '../utils/api';
import { ChatMessage, PrivateMessage, Conversation, User } from '../types';
import { formatDateTime } from '../utils/date';
import { io } from 'socket.io-client';

type ChatMode = 'group' | 'private';

const Chat = () => {
  const { user } = useStore();
  const [chatMode, setChatMode] = useState<ChatMode>('group');
  const [messages, setMessages] = useState<ChatMessage[] | PrivateMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const shouldScrollRef = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const privateChatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (chatMode === 'group') {
          const data = await getChatMessages();
          setMessages(data || []);
        } else if (selectedUser) {
          const data = await getPrivateMessages(selectedUser.id);
          setMessages(data || []);
        }
        
        if (chatMode === 'private') {
          const convos = await getConversations();
          setConversations(convos);
        }
      } catch (err) {
        console.error('获取消息失败:', err);
        setError('获取消息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chatMode, selectedUser]);

  useLayoutEffect(() => {
    const container = chatMode === 'group' ? chatContainerRef.current : privateChatContainerRef.current;
    if (container && shouldScrollRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, chatMode]);

  useEffect(() => {
    const container = chatMode === 'group' ? chatContainerRef.current : privateChatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chatMode]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const socket = io({
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socket.on('chat message', (message: ChatMessage) => {
      if (chatMode === 'group') {
        setMessages(prev => [...prev as ChatMessage[], message]);
        shouldScrollRef.current = true;
      }
    });

    socket.on('private message', (message: PrivateMessage) => {
      if (chatMode === 'private' && selectedUser && 
          (message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id)) {
        setMessages(prev => [...prev as PrivateMessage[], message]);
        shouldScrollRef.current = true;
      }
      getConversations().then(setConversations).catch(console.error);
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
  }, [chatMode, selectedUser]);

  const handleSendGroupMessage = async (e: React.FormEvent) => {
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

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !selectedUser) return;

    try {
      await sendPrivateMessage(selectedUser.id, inputValue.trim());
      setInputValue('');
      getConversations().then(setConversations).catch(console.error);
    } catch (err) {
      console.error('发送私聊消息失败:', err);
      setError('发送私聊消息失败，请稍后重试');
    }
  };

  const handleStartPrivateChat = async (messageUser: User) => {
    setSelectedUser(messageUser);
    setChatMode('private');
    setLoading(true);
    try {
      const data = await getPrivateMessages(messageUser.id);
      setMessages(data || []);
      shouldScrollRef.current = true;
    } catch (err) {
      console.error('获取私聊消息失败:', err);
      setError('获取私聊消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    const user: User = {
      id: conversation.user_id,
      username: conversation.username,
      avatar_url: conversation.avatar_url,
      email: '',
    };
    setSelectedUser(user);
    setLoading(true);
    try {
      const data = await getPrivateMessages(conversation.user_id);
      setMessages(data || []);
      shouldScrollRef.current = true;
    } catch (err) {
      console.error('获取私聊消息失败:', err);
      setError('获取私聊消息失败');
    } finally {
      setLoading(false);
    }
  };

  const isOwnMessage = (message: ChatMessage | PrivateMessage) => {
    if ('user_id' in message) {
      return user?.id === message.user_id;
    }
    return user?.id === message.sender_id;
  };

  const getUsername = (message: ChatMessage | PrivateMessage) => {
    if (message.user?.username) {
      return message.user.username;
    }
    if ('user_id' in message) {
      return '匿名用户';
    }
    return '匿名用户';
  };

  const getUser = (message: ChatMessage | PrivateMessage): User | null => {
    if (message.user) {
      return message.user;
    }
    return null;
  };

  const renderAvatar = (messageUser: User | null, isOwn: boolean) => {
    return (
      <div 
        className={`w-10 h-10 rounded-full flex-shrink-0 ${
          isOwn ? 'order-2' : 'order-1'
        }`}
      >
        {messageUser?.avatar_url ? (
          <img 
            src={messageUser.avatar_url} 
            alt={messageUser.username}
            className="w-full h-full rounded-full object-cover border-2 border-dark-500"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-dark-500">
            {messageUser?.username?.charAt(0) || '?'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="bg-dark-700/50 backdrop-blur-sm rounded-2xl border border-dark-600 shadow-xl overflow-hidden flex h-[600px]">
          <div className="w-72 border-r border-dark-600 flex flex-col">
            <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 px-4 py-4 border-b border-dark-600">
              <h1 className="text-xl font-bold text-white">聊天室</h1>
            </div>

            <div className="flex border-b border-dark-600">
              <button
                onClick={() => { setChatMode('group'); setSelectedUser(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-all ${
                  chatMode === 'group'
                    ? 'bg-primary-600/20 text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`}
              >
                群聊
              </button>
              <button
                onClick={() => { setChatMode('private'); getConversations().then(setConversations).catch(console.error); }}
                className={`flex-1 py-3 text-sm font-medium transition-all ${
                  chatMode === 'private'
                    ? 'bg-primary-600/20 text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600/50'
                }`}
              >
                私信
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chatMode === 'group' ? (
                <div className="p-4">
                  <div className="bg-dark-600/50 rounded-xl p-4 text-center">
                    <svg className="w-10 h-10 mx-auto mb-2 text-primary-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-gray-400 text-sm">群聊模式</p>
                    <p className="text-gray-500 text-xs mt-1">点击其他用户头像可发起私聊</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm">暂无私信会话</p>
                      <p className="text-xs mt-1">在群聊中点击用户头像开始私聊</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.user_id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedUser?.id === conv.user_id
                            ? 'bg-primary-600/20 border border-primary-500/50'
                            : 'hover:bg-dark-600/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full flex-shrink-0">
                          {conv.avatar_url ? (
                            <img 
                              src={conv.avatar_url} 
                              alt={conv.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                              {conv.username?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{conv.username}</p>
                          <p className="text-gray-500 text-xs truncate">{conv.last_message}</p>
                        </div>
                        <span className="text-gray-600 text-xs">
                          {formatDateTime(conv.last_message_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {chatMode === 'group' ? (
              <>
                <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 px-6 py-4 border-b border-dark-600">
                  <h2 className="text-lg font-bold text-white">公共聊天室</h2>
                  <p className="text-gray-400 text-sm mt-1">与其他用户实时交流</p>
                </div>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    (messages as ChatMessage[]).map((message) => {
                      const isOwn = isOwnMessage(message);
                      const messageUser = getUser(message);
                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && messageUser && (
                            <div 
                              onClick={() => handleStartPrivateChat(messageUser)}
                              className="cursor-pointer hover:ring-2 hover:ring-primary-500 rounded-full transition-all"
                              title={`点击发起私聊`}
                            >
                              {renderAvatar(messageUser, isOwn)}
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] ${
                              isOwn
                                ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                                : 'bg-dark-600 text-gray-100 rounded-2xl rounded-bl-md'
                            } p-4 shadow-lg`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold text-sm ${isOwn ? 'text-primary-200' : 'text-primary-400'}`}>
                                {getUsername(message)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(message.created_at)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {isOwn && messageUser && renderAvatar(messageUser, isOwn)}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-dark-600 p-4 bg-dark-700/30">
                  <form onSubmit={handleSendGroupMessage} className="flex gap-3">
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
              </>
            ) : (
              <>
                {selectedUser ? (
                  <>
                    <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 px-6 py-4 border-b border-dark-600 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex-shrink-0">
                        {selectedUser.avatar_url ? (
                          <img 
                            src={selectedUser.avatar_url} 
                            alt={selectedUser.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                            {selectedUser.username?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{selectedUser.username}</h2>
                        <p className="text-gray-400 text-sm">私信聊天</p>
                      </div>
                    </div>

                    <div ref={privateChatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                          <p>还没有消息，快来打个招呼吧！</p>
                        </div>
                      ) : (
                        (messages as PrivateMessage[]).map((message) => {
                          const isOwn = isOwnMessage(message);
                          const messageUser = getUser(message);
                          return (
                            <div
                              key={message.id}
                              className={`flex items-start gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isOwn && messageUser && renderAvatar(messageUser, isOwn)}
                              <div
                                className={`max-w-[80%] ${
                                  isOwn
                                    ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                                    : 'bg-dark-600 text-gray-100 rounded-2xl rounded-bl-md'
                                } p-4 shadow-lg`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`font-semibold text-sm ${isOwn ? 'text-primary-200' : 'text-primary-400'}`}>
                                    {getUsername(message)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDateTime(message.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              {isOwn && messageUser && renderAvatar(messageUser, isOwn)}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-dark-600 p-4 bg-dark-700/30">
                      <form onSubmit={handleSendPrivateMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={`发送消息给 ${selectedUser.username}...`}
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
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>选择一个会话开始聊天</p>
                      <p className="text-sm mt-1">或在群聊中点击用户头像发起私聊</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
