const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
const { db, initDatabase, getStore } = require('./memoryDb');

const logsDir = path.join(__dirname, '../logs');
const logFile = path.join(logsDir, 'server.log');

const isProduction = process.env.NODE_ENV !== 'development';

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  if (level === 'error') {
    console.error(`[${timestamp}] [ERROR] ${message}`, meta);
  } else {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
  try {
    fs.appendFileSync(logFile, logLine);
  } catch (e) {
    console.error('日志写入失败:', e);
  }
};

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://20111108.xyz'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

const userIdSocketMap = new Map();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: '认证请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "*"],
    },
  },
}));

app.use(compression());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

const verificationCodes = new Map();

log(`SMTP配置: host=${process.env.SMTP_HOST}, port=${process.env.SMTP_PORT}, secure=${process.env.SMTP_SECURE}, user=${process.env.SMTP_USER ? '已配置' : '未配置'}, pass=${process.env.SMTP_PASS ? '已配置' : '未配置'}`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"工具乐园" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
    to: email,
    subject: '工具乐园 - 注册验证码',
    html: `
      <div style="max-width: 400px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">工具乐园</h1>
        </div>
        <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #333;">您好！</p>
          <p style="color: #333;">感谢您注册工具乐园，您的验证码是：</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #667eea;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px;">验证码有效期为5分钟，请尽快使用。</p>
          <p style="color: #999; font-size: 14px;">如果这不是您本人的操作，请忽略此邮件。</p>
        </div>
      </div>
    `,
    text: `您好！感谢您注册工具乐园，您的验证码是：${code}。验证码有效期为5分钟，请尽快使用。`,
  };

  log(`[邮件发送] 目标邮箱: ${email}`);
  
  try {
    const info = await transporter.sendMail(mailOptions);
    log(`[邮件发送成功] Message ID: ${info.messageId}`);
  } catch (error) {
    log(`[邮件发送失败] 错误信息: ${error.message}`);
    if (error.response) {
      log(`[邮件发送失败] 服务器响应: ${error.response}`);
    }
    throw error;
  }
};

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, {
  index: false,
  dotfiles: 'deny',
  maxAge: '1d',
  etag: true,
}));

const nonamePath = path.join(__dirname, '../noname/apps/core');
app.use('/sanguosha', express.static(nonamePath, {
  index: 'index.html',
  dotfiles: 'deny',
  maxAge: '1d',
  etag: true,
}));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const result = bcrypt.compareSync(password, user.password);

    if (!result) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      },
      token
    });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    const now = Date.now();
    const lastSend = verificationCodes.get(email);
    if (lastSend && now - lastSend.timestamp < 60000) {
      return res.status(429).json({ error: '发送过于频繁，请稍后再试' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[调试模式] 验证码: ${code}，邮箱: ${email}`);
      verificationCodes.set(email, { code, timestamp: now, expiresAt: now + 300000 });
      return res.json({ message: '验证码已发送（调试模式）', debugCode: code });
    }

    await sendVerificationEmail(email, code);

    verificationCodes.set(email, { code, timestamp: now, expiresAt: now + 300000 });

    setTimeout(() => {
      verificationCodes.delete(email);
    }, 300000);

    res.json({ message: '验证码已发送到您的邮箱' });
  } catch (e) {
    console.error('发送验证码失败:', e);
    return res.status(500).json({ error: '发送验证码失败，请稍后重试' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, username, code } = req.body;

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    const storedCode = verificationCodes.get(email);
    if (!storedCode) {
      return res.status(400).json({ error: '请先获取验证码' });
    }

    if (Date.now() > storedCode.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: '验证码已过期，请重新获取' });
    }

    if (storedCode.code !== code) {
      return res.status(400).json({ error: '验证码错误' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, email, password, username, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, email, hashedPassword, username, createdAt);

    verificationCodes.delete(email);

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      user: {
        id: userId,
        email,
        username,
        avatar_url: null,
        created_at: createdAt
      },
      token
    });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/auth/user', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/tools', (req, res) => {
  try {
    const tools = db.prepare('SELECT * FROM tools ORDER BY created_at DESC').all();
    res.json(tools);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/tools/search', (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.json([]);
  }

  const searchPattern = `%${query}%`;

  try {
    const tools = db.prepare(
      'SELECT * FROM tools WHERE name LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY created_at DESC'
    ).all(searchPattern, searchPattern, searchPattern);
    res.json(tools);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/tools/featured', (req, res) => {
  try {
    const tools = db.prepare('SELECT * FROM tools WHERE featured = 1 ORDER BY created_at DESC').all();
    res.json(tools);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/tools/category/:category', (req, res) => {
  try {
    const tools = db.prepare('SELECT * FROM tools WHERE category = ? ORDER BY created_at DESC').all(req.params.category);
    res.json(tools);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

const parseToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const asyncUpdateViews = (userId, toolId) => {
  try {
    const existingView = db.prepare('SELECT * FROM tool_views WHERE user_id = ? AND tool_id = ?').get(userId, toolId);

    if (!existingView) {
      db.prepare('INSERT INTO tool_views (id, user_id, tool_id, created_at) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), userId, toolId, new Date().toISOString());
      db.prepare('UPDATE tools SET views_count = views_count + 1 WHERE id = ?').run(toolId);
    }
  } catch (e) {
    console.error('更新浏览量失败:', e);
  }
};

app.get('/api/tools/:id', (req, res) => {
  try {
    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: '工具不存在' });
    }

    res.json(tool);

    const decodedToken = parseToken(req);
    if (decodedToken && decodedToken.id) {
      asyncUpdateViews(decodedToken.id, req.params.id);
    }
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM tools').all();

    const result = categories.map(c => {
      const { count } = db.prepare('SELECT COUNT(*) AS count FROM tools WHERE category = ?').get(c.category);
      return { name: c.category, count };
    });

    res.json(result);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/comments/:toolId', (req, res) => {
  try {
    const comments = db.prepare(
      `SELECT comments.*, users.username, users.email 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.tool_id = ? 
       ORDER BY comments.created_at DESC`
    ).all(req.params.toolId);

    res.json(comments.map(c => ({
      ...c,
      user: {
        id: c.user_id,
        username: c.username,
        email: c.email
      }
    })));
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/comments', (req, res) => {
  try {
    const comments = db.prepare(
      `SELECT comments.*, users.username, users.email, tools.name AS tool_name, tools.icon AS tool_icon
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       JOIN tools ON comments.tool_id = tools.id
       ORDER BY comments.created_at DESC
       LIMIT 50`
    ).all();

    res.json(comments.map(c => ({
      ...c,
      user: {
        id: c.user_id,
        username: c.username,
        email: c.email
      },
      tool: {
        id: c.tool_id,
        name: c.tool_name,
        icon: c.tool_icon
      }
    })));
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/comments', authenticateToken, (req, res) => {
  const { tool_id, content, rating, parent_id } = req.body;
  const commentId = uuidv4();
  const createdAt = new Date().toISOString();

  try {
    db.prepare(
      'INSERT INTO comments (id, user_id, tool_id, parent_id, content, rating, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(commentId, req.user.id, tool_id, parent_id || null, content, rating || 5, 0, createdAt);

    const user = db.prepare('SELECT username, email FROM users WHERE id = ?').get(req.user.id);

    res.json({
      id: commentId,
      user_id: req.user.id,
      tool_id,
      parent_id: parent_id || null,
      content,
      rating: rating || 5,
      likes: 0,
      created_at: createdAt,
      user: {
        id: req.user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/comments/:id/likes', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(id);

    const result = db.prepare('SELECT likes FROM comments WHERE id = ?').get(id);
    res.json({ likes: result.likes });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/favorites/:userId', authenticateToken, (req, res) => {
  try {
    const favorites = db.prepare(
      `SELECT favorites.id AS fav_id, favorites.user_id, favorites.tool_id, favorites.created_at AS fav_created_at, 
              tools.id AS tool_id, tools.name, tools.category, tools.description, tools.icon, 
              tools.featured, tools.usage_count, tools.views_count, tools.created_at AS tool_created_at
       FROM favorites 
       JOIN tools ON favorites.tool_id = tools.id 
       WHERE favorites.user_id = ? 
       ORDER BY favorites.created_at DESC`
    ).all(req.params.userId);

    res.json(favorites.map(f => ({
      id: f.fav_id,
      user_id: f.user_id,
      tool_id: f.tool_id,
      name: f.name,
      category: f.category,
      description: f.description,
      icon: f.icon,
      featured: f.featured,
      usage_count: f.usage_count,
      views_count: f.views_count,
      created_at: f.fav_created_at,
    })));
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/favorites', authenticateToken, (req, res) => {
  const { tool_id } = req.body;
  const favoriteId = uuidv4();
  const createdAt = new Date().toISOString();

  try {
    db.prepare(
      'INSERT INTO favorites (id, user_id, tool_id, created_at) VALUES (?, ?, ?, ?)'
    ).run(favoriteId, req.user.id, tool_id, createdAt);

    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(tool_id);

    res.json({
      id: favoriteId,
      user_id: req.user.id,
      tool_id,
      created_at: createdAt,
      tool
    });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: '已收藏该工具' });
    }
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/api/favorites/:toolId', authenticateToken, (req, res) => {
  try {
    db.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND tool_id = ?'
    ).run(req.user.id, req.params.toolId);
    res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/favorites/check/:userId/:toolId', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(
      'SELECT id FROM favorites WHERE user_id = ? AND tool_id = ?'
    ).get(req.params.userId, req.params.toolId);
    res.json({ isFavorite: !!result });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/tools/:id/usage', (req, res) => {
  try {
    db.prepare(
      'UPDATE tools SET usage_count = usage_count + 1 WHERE id = ?'
    ).run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/tools/:id/views', (req, res) => {
  try {
    db.prepare(
      'UPDATE tools SET views_count = views_count + 1 WHERE id = ?'
    ).run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/user-views/:userId', authenticateToken, (req, res) => {
  try {
    const views = db.prepare(
      `SELECT tool_views.id, tool_views.user_id, tool_views.tool_id, tool_views.created_at AS view_created_at, 
              tools.id AS tool_id, tools.name, tools.category, tools.description, tools.icon, 
              tools.featured, tools.usage_count, tools.views_count, tools.created_at AS tool_created_at
       FROM tool_views 
       JOIN tools ON tool_views.tool_id = tools.id 
       WHERE tool_views.user_id = ? 
       ORDER BY tool_views.created_at DESC
       LIMIT 20`
    ).all(req.params.userId);

    res.json(views.map(v => ({
      id: v.id,
      user_id: v.user_id,
      tool_id: v.tool_id,
      name: v.name,
      category: v.category,
      description: v.description,
      icon: v.icon,
      featured: v.featured,
      usage_count: v.usage_count,
      views_count: v.views_count,
      created_at: v.view_created_at,
    })));
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/api/user-views/:viewId', authenticateToken, (req, res) => {
  try {
    db.prepare(
      'DELETE FROM tool_views WHERE id = ? AND user_id = ?'
    ).run(req.params.viewId, req.user.id);
    res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/users/:id/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: '无权修改此用户密码' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '请提供当前密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码长度至少为6位' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const result = bcrypt.compareSync(currentPassword, user.password);

    if (!result) {
      return res.status(401).json({ error: '当前密码不正确' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    ).run(hashedPassword, req.params.id);

    res.json({ success: true, message: '密码修改成功' });
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { username, bio, avatar_url } = req.body;

  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: '无权修改此用户信息' });
  }

  const updates = [];
  const values = [];

  if (username) {
    updates.push('username = ?');
    values.push(username);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    values.push(avatar_url);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: '没有提供需要更新的字段' });
  }

  values.push(req.params.id);

  try {
    db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    const user = db.prepare('SELECT id, email, username, avatar_url, bio, created_at FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (e) {
    return res.status(500).json({ error: '服务器错误' });
  }
});



app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/ip-lookup/:ip', async (req, res) => {
  const { ip } = req.params;
  try {
    const https = require('https');
    return new Promise((resolve) => {
      https.get(`https://ipapi.co/${ip}/json/`, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            res.json({
              ip: result.ip || ip,
              country: result.country_name || result.country_code || '未知',
              city: result.city || '未知',
              isp: result.org || result.asn || '未知',
            });
          } catch {
            res.json({ ip, country: '未知', city: '未知', isp: '未知' });
          }
          resolve();
        });
      }).on('error', () => {
        res.json({ ip, country: '未知', city: '未知', isp: '未知' });
        resolve();
      });
    });
  } catch {
    res.json({ ip, country: '未知', city: '未知', isp: '未知' });
  }
});

app.get('/api/ping-test', async (req, res) => {
  const targets = req.query.targets ? JSON.parse(req.query.targets) : ['baidu.com', 'google.com', 'github.com'];
  const https = require('https');
  
  const results = await Promise.all(targets.map((target) => {
    return new Promise((resolve) => {
      const start = Date.now();
      https.get(`https://${target}`, { timeout: 5000 }, (response) => {
        const end = Date.now();
        response.destroy();
        resolve({
          target,
          latency: end - start,
          status: '在线',
        });
      }).on('error', () => {
        const end = Date.now();
        resolve({
          target,
          latency: end - start,
          status: '离线',
        });
      }).setTimeout(5000, () => {
        const end = Date.now();
        resolve({
          target,
          latency: end - start,
          status: '超时',
        });
      });
    });
  }));
  
  res.json(results);
});

app.get('/api/weather/:city', async (req, res) => {
  const { city } = req.params;
  try {
    const https = require('https');
    return new Promise((resolve) => {
      https.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY || 'demo'}&units=metric&lang=zh_cn`, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.main) {
              res.json({
                city: result.name,
                temp: `${Math.round(result.main.temp)}°C`,
                desc: result.weather?.[0]?.description || '未知',
                humidity: `${result.main.humidity}%`,
                wind: `${result.wind?.speed || 0} m/s`,
                icon: result.weather?.[0]?.icon || '',
              });
            } else {
              res.status(404).json({ error: '未找到该城市的天气信息' });
            }
          } catch {
            res.status(500).json({ error: '天气数据解析失败' });
          }
          resolve();
        });
      }).on('error', () => {
        res.status(500).json({ error: '获取天气信息失败' });
        resolve();
      });
    });
  } catch {
    res.status(500).json({ error: '获取天气信息失败' });
  }
});

const fetchWeatherByGeocode = (city) => {
  return new Promise((resolve) => {
    const https = require('https');
    https.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`, (geoResponse) => {
      let geoData = '';
      geoResponse.on('data', (chunk) => { geoData += chunk; });
      geoResponse.on('end', () => {
        try {
          const geoResult = JSON.parse(geoData);
          if (geoResult.results && geoResult.results.length > 0) {
            const location = geoResult.results[0];
            const lat = location.latitude;
            const lon = location.longitude;
            const cityName = location.name || location.country || city;
            
            https.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_mean,weather_code&timezone=Asia/Shanghai&forecast_days=5`, (weatherResponse) => {
              let weatherData = '';
              weatherResponse.on('data', (chunk) => { weatherData += chunk; });
              weatherResponse.on('end', () => {
                try {
                  const weatherResult = JSON.parse(weatherData);
                  if (weatherResult.daily) {
                    const weatherCodes = {
                      0: '晴', 1: '晴', 2: '多云', 3: '阴',
                      45: '雾', 48: '雾',
                      51: '小雨', 53: '小雨', 55: '小雨',
                      61: '雨', 63: '中雨', 65: '大雨',
                      71: '雪', 73: '小雪', 75: '大雪',
                      80: '阵雨', 81: '阵雨', 82: '强阵雨',
                      95: '雷阵雨', 96: '雷阵雨', 99: '雷阵雨'
                    };
                    
                    const forecast = weatherResult.daily.time.map((date, index) => {
                      const code = weatherResult.daily.weather_code[index];
                      return {
                        date,
                        minTemp: `${Math.round(weatherResult.daily.temperature_2m_min[index])}°C`,
                        maxTemp: `${Math.round(weatherResult.daily.temperature_2m_max[index])}°C`,
                        desc: weatherCodes[code] || '未知',
                        humidity: `${Math.round(weatherResult.daily.relative_humidity_2m_mean[index])}%`,
                        wind: `${weatherResult.daily.wind_speed_10m_mean[index].toFixed(1)} m/s`,
                      };
                    });
                    
                    resolve({ success: true, city: cityName, forecast });
                  } else {
                    resolve({ success: false });
                  }
                } catch {
                  resolve({ success: false });
                }
              });
            }).on('error', () => resolve({ success: false }));
          } else {
            resolve({ success: false });
          }
        } catch {
          resolve({ success: false });
        }
      });
    }).on('error', () => resolve({ success: false }));
  });
};

app.get('/api/weather-forecast/:city', async (req, res) => {
  const { city } = req.params;
  
  try {
    const result = await fetchWeatherByGeocode(city);
    
    if (result.success && result.forecast && result.forecast.length > 0) {
      res.json({
        city: result.city,
        forecast: result.forecast,
      });
    } else {
      res.status(404).json({ 
        error: '未找到该城市', 
        message: '请尝试使用更精确的城市名称，如：北京、上海、郑州' 
      });
    }
  } catch {
    res.status(500).json({ error: '获取天气预报信息失败' });
  }
});

app.get('/api/version', (req, res) => {
  res.json({ version: '2.0.0', apiUrl: '/api', timestamp: new Date().toISOString() });
});

app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, avatar_url FROM users').all();
    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

app.get('/api/private-chat/messages/:receiverId', authenticateToken, (req, res) => {
  const { receiverId } = req.params;
  
  try {
    const privateMessages = getStore('private_messages');
    const users = getStore('users');
    
    const messages = privateMessages
      .filter(m => 
        (m.sender_id === req.user.id && m.receiver_id === receiverId) ||
        (m.sender_id === receiverId && m.receiver_id === req.user.id)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100);
    
    const result = messages.map(m => {
      const senderUser = users.find(u => u.id === m.sender_id);
      return {
        id: m.id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        content: m.content,
        created_at: m.created_at,
        user: senderUser ? {
          id: senderUser.id,
          username: senderUser.username,
          avatar_url: senderUser.avatar_url
        } : null
      };
    });
    
    res.json(result.reverse());
  } catch (error) {
    console.error('获取私聊消息失败:', error);
    res.status(500).json({ error: '获取私聊消息失败' });
  }
});

app.post('/api/private-chat/messages', authenticateToken, (req, res) => {
  const { receiverId, content } = req.body;
  
  if (!receiverId || !content || content.trim() === '') {
    return res.status(400).json({ error: '消息内容和接收者不能为空' });
  }

  try {
    const privateMessages = getStore('private_messages');
    const users = getStore('users');
    
    const messageId = uuidv4();
    const createdAt = new Date().toISOString();
    
    const newMessage = {
      id: messageId,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: content.trim(),
      created_at: createdAt
    };
    
    privateMessages.push(newMessage);

    const senderUser = users.find(u => u.id === req.user.id);
    
    const messageWithUser = {
      id: newMessage.id,
      sender_id: newMessage.sender_id,
      receiver_id: newMessage.receiver_id,
      content: newMessage.content,
      created_at: newMessage.created_at,
      user: senderUser ? {
        id: senderUser.id,
        username: senderUser.username,
        avatar_url: senderUser.avatar_url
      } : null
    };

    const receiverSocketId = userIdSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('private message', messageWithUser);
    }

    res.json(messageWithUser);
  } catch (error) {
    console.error('发送私聊消息失败:', error);
    res.status(500).json({ error: '发送私聊消息失败' });
  }
});

app.get('/api/private-chat/conversations', authenticateToken, (req, res) => {
  try {
    const privateMessages = getStore('private_messages');
    const users = getStore('users');
    
    const conversations = new Map();
    
    privateMessages.forEach(m => {
      if (m.sender_id === req.user.id || m.receiver_id === req.user.id) {
        const otherUserId = m.sender_id === req.user.id ? m.receiver_id : m.sender_id;
        if (!conversations.has(otherUserId)) {
          const otherUser = users.find(u => u.id === otherUserId);
          conversations.set(otherUserId, {
            user_id: otherUserId,
            username: otherUser?.username || '未知用户',
            avatar_url: otherUser?.avatar_url,
            last_message: m.content,
            last_message_at: m.created_at
          });
        }
      }
    });
    
    const result = Array.from(conversations.values()).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
    
    res.json(result);
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ error: '获取会话列表失败' });
  }
});

app.get('/api/chat/messages', authenticateToken, (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT chat_messages.id, chat_messages.user_id, chat_messages.content, chat_messages.created_at,
             users.username, users.avatar_url
      FROM chat_messages
      JOIN users ON chat_messages.user_id = users.id
      ORDER BY chat_messages.created_at DESC
      LIMIT 100
    `).all();
    
    const result = messages.map(m => ({
      id: m.id,
      user_id: m.user_id,
      content: m.content,
      created_at: m.created_at,
      user: {
        id: m.user_id,
        username: m.username,
        avatar_url: m.avatar_url
      }
    }));
    
    res.json(result.reverse());
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    res.status(500).json({ error: '获取聊天消息失败' });
  }
});

app.post('/api/chat/messages', authenticateToken, (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  try {
    const messageId = uuidv4();
    const createdAt = new Date().toISOString();
    
    db.prepare(
      'INSERT INTO chat_messages (id, user_id, content, created_at) VALUES (?, ?, ?, ?)'
    ).run(messageId, req.user.id, content.trim(), createdAt);

    const message = db.prepare(`
      SELECT chat_messages.id, chat_messages.user_id, chat_messages.content, chat_messages.created_at,
             users.username, users.avatar_url
      FROM chat_messages
      JOIN users ON chat_messages.user_id = users.id
      WHERE chat_messages.id = ?
    `).get(messageId);

    const messageWithUser = {
      id: message.id,
      user_id: message.user_id,
      content: message.content,
      created_at: message.created_at,
      user: {
        id: message.user_id,
        username: message.username,
        avatar_url: message.avatar_url
      }
    };

    io.emit('chat message', messageWithUser);

    res.json(messageWithUser);
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

app.get('/', (req, res) => {
  if (isProduction) {
    const indexPath = path.join(__dirname, '../dist', 'index.html');
    res.sendFile(indexPath);
  } else {
    res.send('工具网站后端服务运行中');
  }
});



io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return next(new Error('无效的令牌'));
      }
      socket.user = user;
      next();
    });
  } else {
    socket.user = null;
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.user) {
    userIdSocketMap.set(socket.user.id, socket.id);
    console.log(`用户连接: ${socket.user.id}, socketId: ${socket.id}`);
  } else {
    console.log('匿名客户端连接:', socket.id);
  }



  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    if (socket.user) {
      userIdSocketMap.delete(socket.user.id);
    }
  });

  socket.on('webrtc-offer', ({ roomId, offer, targetSocketId }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-offer', { offer, fromSocketId: socket.id });
    } else {
      socket.to(roomId).emit('webrtc-offer', { offer, fromSocketId: socket.id });
    }
  });

  socket.on('webrtc-answer', ({ roomId, answer, targetSocketId }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-answer', { answer, fromSocketId: socket.id });
    }
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetSocketId }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-ice-candidate', { candidate, fromSocketId: socket.id });
    } else {
      socket.to(roomId).emit('webrtc-ice-candidate', { candidate, fromSocketId: socket.id });
    }
  });

  socket.on('voice-status', ({ roomId, isMuted }) => {
    socket.to(roomId).emit('voice-status-update', { socketId: socket.id, isMuted });
  });
});

app.use((err, req, res, next) => {
  log('error', '服务器错误', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: '请求的资源不存在',
      status: 404,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

async function startServer() {
  initDatabase();
  return new Promise((resolve) => {
    const httpServer = server.listen(PORT, () => {
      log('info', `服务器运行在 http://localhost:${PORT}`);
      log('info', `WebSocket 运行在 ws://localhost:${PORT}`);
      log('info', `环境: ${process.env.NODE_ENV === 'production' ? '生产' : '开发'}`);
      log('info', `CORS允许来源: ${allowedOrigins.join(', ')}`);
      resolve(httpServer);
    });
    
    httpServer.on('error', (err) => {
      log('error', '服务器启动失败', { error: err.message });
      console.error('服务器启动失败:', err);
      process.exit(1);
    });
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('数据库初始化失败:', err);
  });
}

module.exports = { startServer, app };