import { create } from 'zustand';
import { User, Comment } from '../types';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  favorites: string[];
  addFavorite: (toolId: string) => void;
  removeFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  
  comments: Comment[];
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  pageTitle: string;
  setPageTitle: (title: string) => void;
  
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  favorites: [],
  addFavorite: (toolId) => set((state) => ({
    favorites: [...state.favorites, toolId],
  })),
  removeFavorite: (toolId) => set((state) => ({
    favorites: state.favorites.filter((id) => id !== toolId),
  })),
  isFavorite: (toolId) => get().favorites.includes(toolId),
  
  comments: [],
  setComments: (comments) => set({ comments }),
  addComment: (comment) => set((state) => ({
    comments: [comment, ...state.comments],
  })),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  searchHistory: (() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  })(),
  addSearchHistory: (query) => set((state) => {
    if (!query.trim()) return state;
    const newHistory = [query, ...state.searchHistory.filter(h => h !== query)].slice(0, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    return { searchHistory: newHistory };
  }),
  clearSearchHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('searchHistory');
    }
    set({ searchHistory: [] });
  },
  
  pageTitle: '工具乐园',
  setPageTitle: (title) => set({ pageTitle: title }),
  
  notifications: [],
  addNotification: (type, message) => set((state) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
    };
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter(n => n.id !== notification.id),
      }));
    }, 5000);
    return { notifications: [...state.notifications, notification] };
  }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
  clearNotifications: () => set({ notifications: [] }),
  
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
