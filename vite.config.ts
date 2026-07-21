import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置文件
// defineConfig: 创建 Vite 配置对象的辅助函数
// react: 用于支持 React 的 Vite 插件

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
