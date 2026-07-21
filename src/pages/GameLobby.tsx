import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface Room {
  id: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  gamePhase: string;
}

const GameLobby = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchRooms();
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/game/rooms');
      const data = await response.json();
      setRooms(data);
      setLoading(false);
    } catch (err) {
      console.error('获取房间列表失败:', err);
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/game/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: user.username || '玩家' }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/game/${data.roomId}`);
      } else {
        setError(data.error || '创建房间失败');
      }
    } catch (err) {
      console.error('创建房间失败:', err);
      setError('创建房间失败');
    }
  };

  const joinRoom = async () => {
    if (!user || !roomIdInput.trim()) {
      setError('请输入房间ID');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/game/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId: roomIdInput.trim(), username: user.username || '玩家' }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/game/${data.roomId}`);
      } else {
        setError(data.error || '无法加入房间');
      }
    } catch (err) {
      console.error('加入房间失败:', err);
      setError('加入房间失败');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-transition pt-20 min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">三国杀</h1>
          <p className="text-gray-400">多人联机策略卡牌游戏</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">创建房间</h2>
            <button
              onClick={createRoom}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-primary-500/30"
            >
              创建新房间
            </button>
            <p className="text-gray-500 text-sm mt-4 text-center">作为房主创建一个新游戏房间</p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">加入房间</h2>
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="输入房间ID"
              className="w-full bg-dark-700/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors mb-4"
            />
            <button
              onClick={joinRoom}
              className="w-full py-4 bg-dark-700/50 border border-primary-500/50 text-primary-400 rounded-xl font-semibold text-lg hover:bg-primary-500/20 hover:border-primary-500 transition-all"
            >
              加入房间
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">房间列表</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <p className="text-gray-500">暂无房间，创建一个新房间开始游戏吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className={`glass-card p-6 cursor-pointer transition-all hover:scale-105 ${
                    room.gamePhase === 'playing' ? 'opacity-60' : ''
                  }`}
                  onClick={() => room.gamePhase === 'waiting' && setRoomIdInput(room.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{room.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      room.gamePhase === 'waiting' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {room.gamePhase === 'waiting' ? '等待中' : '游戏中'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>房主</span>
                      <span>{room.hostName}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>玩家</span>
                      <span>{room.playerCount} / {room.maxPlayers}</span>
                    </div>
                  </div>
                  {room.gamePhase === 'waiting' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomIdInput(room.id);
                      }}
                      className="mt-4 w-full py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                    >
                      加入
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-4">游戏规则（第一阶段）</h2>
          <div className="text-gray-400 space-y-2 text-sm">
            <p>• 游戏支持 2-4 名玩家联机对战</p>
            <p>• 每位玩家初始拥有 4 点体力和 4 张手牌</p>
            <p>• 基本牌：【杀】（攻击）、【闪】（防御）、【桃】（恢复体力）</p>
            <p>• 回合开始时摸 2 张牌，出牌阶段可以使用手牌</p>
            <p>• 使用【杀】攻击其他玩家，对方可使用【闪】闪避</p>
            <p>• 当体力降至 0 时阵亡，最后存活的玩家获胜</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
