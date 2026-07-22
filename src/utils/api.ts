import { User, ChatMessage } from '../types';

const API_BASE_URL = '';

let token = localStorage.getItem('auth_token');

export const setToken = (newToken: string | null) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('auth_token', newToken);
  } else {
    localStorage.removeItem('auth_token');
  }
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '登录失败');
  }
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const sendCode = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '发送验证码失败');
  }
  
  return data;
};

export const signUp = async (email: string, password: string, username: string, code: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, username, code }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '注册失败');
  }
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const signOut = async () => {
  setToken(null);
  return true;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!token) {
    return null;
  }
  
  const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    setToken(null);
    return null;
  }
  
  const data = await response.json();
  return data;
};

export const getTools = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tools`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取工具列表失败');
  }
  
  return await response.json();
};

export const getToolById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tools/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取工具详情失败');
  }
  
  return await response.json();
};

export const getToolsByCategory = async (category: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tools/category/${encodeURIComponent(category)}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取分类工具失败');
  }
  
  return await response.json();
};

export const getFeaturedTools = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tools/featured`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取精选工具失败');
  }
  
  return await response.json();
};

export const searchTools = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tools/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('搜索工具失败');
  }
  
  return await response.json();
};

export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取分类列表失败');
  }
  
  return await response.json();
};

export const getComments = async (toolId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/comments/${toolId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取评论失败');
  }
  
  return await response.json();
};

export const getAllComments = async () => {
  const response = await fetch(`${API_BASE_URL}/api/comments`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取评论失败');
  }
  
  return await response.json();
};

export const addComment = async (toolId: string, content: string, rating: number, parent_id?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ tool_id: toolId, content, rating, parent_id }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '添加评论失败');
  }
  
  return data;
};

export const likeComment = async (commentId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/likes`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '点赞失败');
  }
  
  return data;
};

export const getFavorites = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${userId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取收藏列表失败');
  }
  
  return await response.json();
};

export const addFavorite = async (toolId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ tool_id: toolId }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '添加收藏失败');
  }
  
  return data;
};

export const removeFavorite = async (toolId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${toolId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('移除收藏失败');
  }
  
  return true;
};

export const isFavorite = async (userId: string, toolId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/check/${userId}/${toolId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    return false;
  }
  
  const data = await response.json();
  return data.isFavorite || false;
};

export const incrementUsageCount = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tools/${id}/usage`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('更新使用次数失败');
  }
  
  return true;
};

export const incrementViewCount = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/api/tools/${id}/views`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('更新浏览量失败');
  }
  
  return true;
};

export const getUserViews = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/user-views/${userId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取浏览历史失败');
  }
  
  return await response.json();
};

export const deleteUserView = async (viewId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/user-views/${viewId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('删除浏览记录失败');
  }
  
  return true;
};

export const updateUserProfile = async (userId: string, data: { username?: string; bio?: string; avatar_url?: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || '更新用户资料失败');
  }
  
  return result;
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || '修改密码失败');
  }
  
  return result;
};

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('获取聊天消息失败');
  }
  
  return await response.json();
};

export const sendChatMessage = async (content: string): Promise<ChatMessage> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '发送消息失败');
  }
  
  return data;
};