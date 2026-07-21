// 应用入口文件
// 负责渲染 React 应用到 DOM 中

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 创建 React 根节点
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
