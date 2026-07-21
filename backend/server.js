const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { db, initDatabase } = require('./memoryDb');
const { GameEngine } = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

const gameEngine = new GameEngine();
const socketRoomMap = new Map();

app.use(cors());
app.use(express.json());

const isProduction = true;

if (isProduction) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
}

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

app.post('/api/auth/register', (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: '该邮箱已被注册' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, email, password, username, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, email, hashedPassword, username, createdAt);

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
      `SELECT favorites.*, tools.* 
       FROM favorites 
       JOIN tools ON favorites.tool_id = tools.id 
       WHERE favorites.user_id = ? 
       ORDER BY favorites.created_at DESC`
    ).all(req.params.userId);

    res.json(favorites.map(f => ({
      ...f,
      tool: {
        id: f.tool_id,
        name: f.name,
        category: f.category,
        description: f.description,
        icon: f.icon,
        featured: f.featured,
        usage_count: f.usage_count,
        created_at: f.created_at
      }
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
      `SELECT tool_views.*, tools.* 
       FROM tool_views 
       JOIN tools ON tool_views.tool_id = tools.id 
       WHERE tool_views.user_id = ? 
       ORDER BY tool_views.created_at DESC
       LIMIT 20`
    ).all(req.params.userId);

    res.json(views.map(v => ({
      ...v,
      tool: {
        id: v.tool_id,
        name: v.name,
        category: v.category,
        description: v.description,
        icon: v.icon,
        featured: v.featured,
        usage_count: v.usage_count,
        views_count: v.views_count,
        created_at: v.created_at
      }
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

app.get('/api/game/rooms', (req, res) => {
  res.json(gameEngine.getAllRooms());
});

app.post('/api/game/create-room', authenticateToken, (req, res) => {
  const { username } = req.body;
  const roomId = gameEngine.createRoom(req.user.id, username);
  res.json({ roomId });
});

app.post('/api/game/join-room', authenticateToken, (req, res) => {
  const { roomId, username } = req.body;
  const room = gameEngine.joinRoom(roomId, req.user.id, username);
  if (room) {
    res.json({ success: true, roomId });
  } else {
    res.status(400).json({ error: '无法加入房间' });
  }
});

app.get('/api/game/room/:roomId', authenticateToken, (req, res) => {
  const publicState = gameEngine.getPublicState(req.params.roomId);
  if (publicState) {
    res.json(publicState);
  } else {
    res.status(404).json({ error: '房间不存在' });
  }
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  if (isProduction) {
    const indexPath = path.join(__dirname, '../dist', 'index.html');
    res.sendFile(indexPath);
  } else {
    res.send('工具网站后端服务运行中');
  }
});

if (isProduction) {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../dist', 'index.html');
    res.sendFile(indexPath);
  });
}

io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);

  socket.on('join-room', ({ roomId, playerId, username }) => {
    socket.join(roomId);
    socketRoomMap.set(socket.id, roomId);
    gameEngine.setSocketId(roomId, playerId, socket.id);

    const publicState = gameEngine.getPublicState(roomId);
    if (publicState) {
      io.to(roomId).emit('room-update', publicState);

      const privateState = gameEngine.getPrivateState(roomId, playerId);
      if (privateState) {
        socket.emit('private-state', privateState);
      }
    }
  });

  socket.on('toggle-ready', ({ roomId, playerId }) => {
    const room = gameEngine.toggleReady(roomId, playerId);
    if (room) {
      const publicState = gameEngine.getPublicState(roomId);
      io.to(roomId).emit('room-update', publicState);
    }
  });

  socket.on('start-game', ({ roomId }) => {
    const room = gameEngine.startGame(roomId);
    if (room) {
      const publicState = gameEngine.getPublicState(roomId);
      io.to(roomId).emit('room-update', publicState);

      room.players.forEach(player => {
        if (player.socketId) {
          const privateState = gameEngine.getPrivateState(roomId, player.id);
          if (privateState) {
            io.to(player.socketId).emit('private-state', privateState);
          }
        }
      });
    }
  });

  socket.on('play-card', ({ roomId, playerId, cardId, targetPlayerId }) => {
    const result = gameEngine.playCard(roomId, playerId, cardId, targetPlayerId);

    if (result && result.success) {
      const publicState = gameEngine.getPublicState(roomId);
      io.to(roomId).emit('room-update', publicState);

      const privateState = gameEngine.getPrivateState(roomId, playerId);
      if (privateState) {
        socket.emit('private-state', privateState);
      }

      if (!result.targetDefended && targetPlayerId) {
        setTimeout(() => {
          gameEngine.takeDamage(roomId, targetPlayerId, 1);
          const newPublicState = gameEngine.getPublicState(roomId);
          io.to(roomId).emit('room-update', newPublicState);

          const targetPrivateState = gameEngine.getPrivateState(roomId, targetPlayerId);
          if (targetPrivateState) {
            const targetSocket = Array.from(socketRoomMap.entries()).find(([_, rid]) => rid === roomId &&
              gameEngine.getRoom(roomId)?.players.find(p => p.id === targetPlayerId)?.socketId === _);
            if (targetSocket) {
              io.to(targetSocket[0]).emit('private-state', targetPrivateState);
            }
          }
        }, 1000);
      }
    } else {
      socket.emit('play-card-error', result?.message || '出牌失败');
    }
  });

  socket.on('end-turn', ({ roomId, playerId }) => {
    const room = gameEngine.endTurn(roomId, playerId);
    if (room) {
      const publicState = gameEngine.getPublicState(roomId);
      io.to(roomId).emit('room-update', publicState);

      room.players.forEach(player => {
        if (player.socketId) {
          const privateState = gameEngine.getPrivateState(roomId, player.id);
          if (privateState) {
            io.to(player.socketId).emit('private-state', privateState);
          }
        }
      });
    }
  });

  socket.on('leave-room', ({ roomId, playerId }) => {
    gameEngine.leaveRoom(roomId, playerId);
    socket.leave(roomId);
    socketRoomMap.delete(socket.id);

    const publicState = gameEngine.getPublicState(roomId);
    if (publicState) {
      io.to(roomId).emit('room-update', publicState);
    }
  });

  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    const roomId = socketRoomMap.get(socket.id);
    if (roomId) {
      gameEngine.setOffline(roomId, socket.id);
      socketRoomMap.delete(socket.id);

      const publicState = gameEngine.getPublicState(roomId);
      if (publicState) {
        io.to(roomId).emit('room-update', publicState);
      }

      socket.to(roomId).emit('peer-disconnected', { socketId: socket.id });
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

async function startServer() {
  initDatabase();
  return new Promise((resolve) => {
    const httpServer = server.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`WebSocket 运行在 ws://localhost:${PORT}`);
      resolve(httpServer);
    });
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('数据库初始化失败:', err);
  });
}

module.exports = { startServer, app };
