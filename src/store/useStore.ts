// Zustand 状态管理文件
// Zustand 是一个轻量级的状态管理库，比 Redux 更简单易用

import { create } from 'zustand';
import { User, Comment } from '../types';

// 定义状态接口
interface StoreState {
  // 用户状态
  user: User | null;
  setUser: (user: User | null) => void;
  
  // 加载状态
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 收藏列表
  favorites: string[];
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  
  // 评论列表
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  
  // 搜索关键词
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // 当前页面标题
  pageTitle: string;
  setPageTitle: (title: string) => void;
  
  // 主题模式
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

// 创建 Zustand store
export const useStore = create<StoreState>((set, get) => ({
  // 用户状态，初始为 null
  user: null,
  setUser: (user) => set({ user }),
  
  // 加载状态，初始为 false
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  // 收藏列表，存储已收藏的工具 ID
  favorites: [],
  addFavorite: (toolId) => set((state) => ({
    favorites: [...state.favorites, toolId],
  })),
  removeFavorite: (toolId) => set((state) => ({
    favorites: state.favorites.filter((id) => id !== toolId),
  })),
  isFavorite: (toolId) => get().favorites.includes(toolId),
  
  // 评论列表
  comments: [],
  setComments: (comments) => set({ comments }),
  addComment: (comment) => set((state) => ({
    comments: [comment, ...state.comments],
  })),
  
  // 搜索关键词
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // 当前页面标题
  pageTitle: '工具乐园',
  setPageTitle: (title) => set({ pageTitle: title }),
  
  // 主题模式，从 localStorage 获取或默认深色模式
  theme: (() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    }
    return 'dark';
  })(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.body.className = newTheme;
    }
    return { theme: newTheme };
  }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.body.className = theme;
    }
    set({ theme });
  },
}));
