import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface Equipment {
  weapon: { name: string; type: string } | null;
  armor: { name: string; type: string } | null;
  positiveMount: { name: string; type: string } | null;
  negativeMount: { name: string; type: string } | null;
}

interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  handCardCount: number;
  isOnline: boolean;
  isReady: boolean;
  socketId?: string;
  equipment: Equipment;
}

interface Card {
  id: string;
  type: string;
  name: string;
  suit: string;
  value: number;
  attackRange?: number;
  description?: string;
  mountType?: string;
}

interface PublicState {
  id: string;
  hostName: string;
  players: Player[];
  currentPlayerIndex: number;
  gamePhase: string;
  turnNumber: number;
  logs: string[];
  discardPileCount: number;
  deckCount: number;
}

interface PrivateState {
  handCards: Card[];
  isMyTurn: boolean;
}

type VoiceMode = 'always' | 'push-to-talk';

const GameRoom = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const { user } = useStore();
  const navigate = useNavigate();
  
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [privateState, setPrivateState] = useState<PrivateState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [voiceMode, setVoiceMode] = useState<VoiceMode>('always');
  const [isMuted, setIsMuted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioDataArray, setAudioDataArray] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/game');
      return;
    }

    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    newSocket.on('room-update', (state) => {
      setPublicState(state);
    });

    newSocket.on('private-state', (state) => {
      setPrivateState(state);
    });

    newSocket.on('play-card-error', (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    });

    newSocket.on('webrtc-offer', async ({ offer, fromSocketId }) => {
      console.log('收到webrtc-offer from:', fromSocketId);
      let peerConnection = peerConnections.get(fromSocketId);
      if (!peerConnection) {
        peerConnection = createPeerConnection(newSocket, fromSocketId);
      }
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        newSocket.emit('webrtc-answer', { roomId, answer, targetSocketId: fromSocketId });
        console.log('发送webrtc-answer to:', fromSocketId);
      } catch (err) {
        console.error('处理offer失败:', err);
        setError('建立语音连接失败');
      }
    });

    newSocket.on('webrtc-answer', async ({ answer, fromSocketId }) => {
      const peerConnection = peerConnections.get(fromSocketId);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('处理answer失败:', err);
        }
      }
    });

    newSocket.on('webrtc-ice-candidate', ({ candidate, fromSocketId }) => {
      const peerConnection = peerConnections.get(fromSocketId);
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
          console.error('添加ICE候选失败:', err);
        });
      }
    });

    newSocket.on('peer-disconnected', ({ socketId }) => {
      const pc = peerConnections.get(socketId);
      if (pc) {
        pc.close();
        setPeerConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
      }
    });

    newSocket.emit('join-room', { roomId, playerId: user.id, username: user.username || '玩家' });

    return () => {
      newSocket.disconnect();
      peerConnections.forEach(pc => pc.close());
      localStream?.getTracks().forEach(track => track.stop());
      audioContext?.close();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [user, roomId, navigate]);

  const createPeerConnection = useCallback((socket: Socket, targetSocketId: string): RTCPeerConnection => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    if (localStream) {
      localStream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, localStream!);
        console.log('添加本地音轨到PeerConnection:', track.kind, sender);
      });
    } else {
      console.warn('创建PeerConnection时本地流为空');
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', { roomId, candidate: event.candidate, targetSocketId });
        console.log('发送ICE候选到:', targetSocketId);
      } else {
        console.log('ICE收集完成 for:', targetSocketId);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('PeerConnection状态变化:', pc.connectionState, 'for:', targetSocketId);
      if (pc.connectionState === 'connected') {
        console.log('语音连接已建立:', targetSocketId);
      } else if (pc.connectionState === 'failed') {
        console.error('语音连接失败:', targetSocketId);
        setError('与其他玩家的语音连接失败');
      }
    };

    pc.ontrack = (event) => {
      console.log('收到远程音轨:', event.track.kind, 'from:', targetSocketId);
      const existingAudio = document.getElementById(`audio-${targetSocketId}`) as HTMLAudioElement;
      if (existingAudio) {
        existingAudio.srcObject = event.streams[0];
      } else {
        const audioElement = document.createElement('audio');
        audioElement.srcObject = event.streams[0];
        audioElement.autoplay = true;
        audioElement.id = `audio-${targetSocketId}`;
        audioElement.volume = 1;
        document.body.appendChild(audioElement);
      }
    };

    setPeerConnections(prev => new Map(prev).set(targetSocketId, pc));

    return pc;
  }, [localStream, roomId]);

  const initVoice = useCallback(async () => {
    try {
      console.log('尝试获取麦克风权限...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      console.log('麦克风权限获取成功');
      setLocalStream(stream);

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);

      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      setAnalyser(analyserNode);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserNode);

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount) as unknown as Uint8Array<ArrayBuffer>;
      setAudioDataArray(dataArray);

      const track = stream.getAudioTracks()[0];
      track.enabled = !isMuted;

      setVoiceEnabled(true);
      setIsMuted(false);
      socket?.emit('voice-status', { roomId, isMuted: false });

      setupAudioVisualizer();
    } catch (err) {
      console.error('获取麦克风权限失败:', err);
      setError('无法获取麦克风权限，请检查浏览器设置');
    }
  }, [socket, roomId, isMuted, publicState]);

  const setupAudioVisualizer = useCallback(() => {
    const visualize = () => {
      if (!analyser || !audioDataArray) return;

      analyser.getByteFrequencyData(audioDataArray);
      const average = Array.from(audioDataArray).reduce((a, b) => a + b) / audioDataArray.length;
      setIsSpeaking(average > 10);

      animationFrameRef.current = requestAnimationFrame(visualize);
    };

    visualize();
  }, [analyser, audioDataArray]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    const track = localStream.getAudioTracks()[0];
    track.enabled = !newMuted;

    socket?.emit('voice-status', { roomId, isMuted: newMuted });
  }, [isMuted, localStream, socket, roomId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (voiceMode === 'push-to-talk' && e.code === 'Space') {
      e.preventDefault();
      if (localStream) {
        const track = localStream.getAudioTracks()[0];
        track.enabled = true;
        setIsMuted(false);
        socket?.emit('voice-status', { roomId, isMuted: false });
      }
    }
  }, [voiceMode, localStream, socket, roomId]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (voiceMode === 'push-to-talk' && e.code === 'Space') {
      e.preventDefault();
      if (localStream) {
        const track = localStream.getAudioTracks()[0];
        track.enabled = false;
        setIsMuted(true);
        socket?.emit('voice-status', { roomId, isMuted: true });
      }
    }
  }, [voiceMode, localStream, socket, roomId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const connectToPeers = useCallback(() => {
    if (!socket || !localStream || !publicState) {
      console.log('connectToPeers条件不满足:', { socket: !!socket, localStream: !!localStream, publicState: !!publicState });
      return;
    }

    console.log('开始连接到其他玩家...');
    publicState.players.forEach(player => {
      if (player.socketId && player.id !== user?.id) {
        if (!peerConnections.has(player.socketId)) {
          console.log('创建PeerConnection for:', player.name, player.socketId);
          const pc = createPeerConnection(socket, player.socketId);
          pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: false,
          }).then(offer => {
            return pc.setLocalDescription(offer);
          }).then(() => {
            socket.emit('webrtc-offer', { roomId, offer: pc.localDescription, targetSocketId: player.socketId });
            console.log('发送offer到:', player.name);
          }).catch(err => {
            console.error('创建offer失败:', err);
            setError('创建语音连接失败');
          });
        } else {
          console.log('已存在PeerConnection for:', player.name);
        }
      } else if (player.id !== user?.id) {
        console.log('玩家没有socketId:', player.name);
      }
    });
  }, [socket, localStream, publicState, user, roomId, peerConnections, createPeerConnection]);

  useEffect(() => {
    if (voiceEnabled && publicState?.gamePhase === 'playing') {
      console.log('触发connectToPeers: voiceEnabled=true, gamePhase=playing');
      connectToPeers();
    }
  }, [voiceEnabled, publicState, connectToPeers]);

  useEffect(() => {
    if (publicState?.gamePhase === 'playing') {
      console.log('游戏开始，检查语音状态...');
      if (voiceEnabled) {
        setTimeout(() => connectToPeers(), 500);
      }
    }
  }, [publicState?.gamePhase, voiceEnabled, connectToPeers]);

  useEffect(() => {
    if (localStream) {
      console.log('本地音频流就绪，检查是否需要为现有PeerConnection添加音轨');
      peerConnections.forEach((pc, socketId) => {
        const senders = pc.getSenders();
        const hasAudioSender = senders.some(sender => sender.track?.kind === 'audio');
        if (!hasAudioSender) {
          console.log('为PeerConnection添加音轨:', socketId);
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream!);
          });
        }
      });
    }
  }, [localStream, peerConnections]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [publicState?.logs]);

  const toggleReady = useCallback(() => {
    if (!socket || !roomId || !user) return;
    socket.emit('toggle-ready', { roomId, playerId: user.id });
  }, [socket, roomId, user]);

  const startGame = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit('start-game', { roomId });
  }, [socket, roomId]);

  const selectCard = useCallback((card: Card) => {
    if (!privateState?.isMyTurn) return;
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      setSelectedTarget(null);
    } else {
      setSelectedCard(card);
      setSelectedTarget(null);
    }
  }, [privateState?.isMyTurn, selectedCard]);

  const selectTarget = useCallback((playerId: string) => {
    if (!selectedCard || !privateState?.isMyTurn) return;
    setSelectedTarget(playerId);
  }, [selectedCard, privateState?.isMyTurn]);

  const playCard = useCallback(() => {
    if (!socket || !roomId || !user || !selectedCard) return;
    
    const targetPlayerId = selectedCard.type === 'attack' || selectedCard.type === 'trick_take' ? selectedTarget : null;
    socket.emit('play-card', { roomId, playerId: user.id, cardId: selectedCard.id, targetPlayerId });
    setSelectedCard(null);
    setSelectedTarget(null);
  }, [socket, roomId, user, selectedCard, selectedTarget]);

  const endTurn = useCallback(() => {
    if (!socket || !roomId || !user) return;
    socket.emit('end-turn', { roomId, playerId: user.id });
  }, [socket, roomId, user]);

  const leaveRoom = useCallback(() => {
    if (!socket || !roomId || !user) {
      navigate('/game');
      return;
    }
    socket.emit('leave-room', { roomId, playerId: user.id });
    navigate('/game');
  }, [socket, roomId, user, navigate]);

  const getCardColor = (type: string) => {
    switch (type) {
      case 'attack': return 'border-red-500 bg-red-500/20 text-red-400';
      case 'defend': return 'border-blue-500 bg-blue-500/20 text-blue-400';
      case 'heal': return 'border-green-500 bg-green-500/20 text-green-400';
      case 'weapon': return 'border-orange-500 bg-orange-500/20 text-orange-400';
      case 'armor': return 'border-purple-500 bg-purple-500/20 text-purple-400';
      case 'mount_positive': return 'border-yellow-500 bg-yellow-500/20 text-yellow-400';
      case 'mount_negative': return 'border-gray-500 bg-gray-500/20 text-gray-400';
      case 'trick_take':
      case 'trick_destroy':
      case 'trick_draw':
      case 'trick_attack_all':
      case 'trick_defend_all':
        return 'border-pink-500 bg-pink-500/20 text-pink-400';
      default: return 'border-gray-500 bg-gray-500/20 text-gray-400';
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'defend': return '🛡️';
      case 'heal': return '🍑';
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'mount_positive': return '🐴';
      case 'mount_negative': return '🦄';
      default: return '📜';
    }
  };

  const getEquipmentIcon = (type: string | undefined) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'mount_positive': return '🐴';
      case 'mount_negative': return '🦄';
      default: return '';
    }
  };

  const getPlayerPosition = (index: number, total: number) => {
    if (total === 2) {
      return index === 0 ? 'top' : 'bottom';
    }
    if (total === 3) {
      return ['top', 'left', 'right'][index];
    }
    return ['top', 'left', 'bottom', 'right'][index];
  };

  const isCurrentPlayer = (index: number) => publicState?.currentPlayerIndex === index;

  if (!user || !roomId) {
    return null;
  }

  if (!publicState) {
    return (
      <div className="page-transition pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlayer = publicState.players[publicState.currentPlayerIndex];
  const isMyTurn = privateState?.isMyTurn || false;
  const isHost = publicState.hostName === (user.username || '玩家');
  const canStart = publicState.gamePhase === 'waiting' && 
                   publicState.players.length >= 2 && 
                   publicState.players.every(p => p.isReady);
  const myPlayerData = publicState.players.find(p => p.id === user.id);

  return (
    <div className="page-transition pt-20 min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg">
          {error}
        </div>
      )}

      <div className="fixed top-24 right-4 z-40 flex flex-col gap-2">
        {publicState.gamePhase === 'playing' && (
          <div className="glass-card px-4 py-2">
            <div className="flex items-center gap-3">
              {!voiceEnabled ? (
                <button
                  onClick={initVoice}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  开启语音
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isMuted 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    } ${isSpeaking ? 'animate-pulse' : ''}`}
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23"/>
                        <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                    )}
                    {isMuted ? '静音' : '麦克风'}
                    {isSpeaking && !isMuted && (
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVoiceMode('always')}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        voiceMode === 'always' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-dark-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      常开
                    </button>
                    <button
                      onClick={() => setVoiceMode('push-to-talk')}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        voiceMode === 'push-to-talk' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-dark-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      按键
                    </button>
                  </div>
                </>
              )}
            </div>
            {voiceMode === 'push-to-talk' && (
              <div className="text-gray-500 text-xs mt-2 bg-dark-700/50 px-3 py-1 rounded-lg">
                按住 空格键 说话
              </div>
            )}
          </div>
        )}
        <button
          onClick={leaveRoom}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          离开房间
        </button>
      </div>

      {publicState.gamePhase === 'waiting' ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="9" y="9" width="6" height="6"/>
                  <circle cx="12" cy="12" r="1"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-6">等待开始</h2>
              <p className="text-gray-400 mb-2">房间 ID: {roomId}</p>
              <p className="text-gray-500 text-sm mb-8">等待其他玩家加入...</p>
            </div>

            <div className="space-y-3 mb-8">
              {publicState.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    player.id === user.id 
                      ? 'border-accent-500 bg-accent-500/10' 
                      : 'border-dark-600 bg-dark-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      player.id === user.id 
                        ? 'bg-accent-500/20 text-accent-400' 
                        : 'bg-dark-600 text-gray-400'
                    }`}>
                      {player.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    player.isReady 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {player.isReady ? '已准备' : '未准备'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={toggleReady}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  myPlayerData?.isReady
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-700/50 text-gray-300 border border-dark-600 hover:border-primary-500'
                }`}
              >
                {myPlayerData?.isReady ? '取消准备' : '准备'}
              </button>
              {isHost && canStart && (
                <button
                  onClick={startGame}
                  className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-blue-600 transition-all"
                >
                  开始游戏
                </button>
              )}
            </div>
          </div>
        </div>
      ) : publicState.gamePhase === 'ended' ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">游戏结束</h2>
            <p className="text-xl text-gray-400 mb-8">
              {publicState.logs[publicState.logs.length - 1]}
            </p>
            <button
              onClick={leaveRoom}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold text-lg"
            >
              返回大厅
            </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
            <div className="text-center">
              <div className={`px-6 py-2 rounded-full font-bold text-lg ${
                isMyTurn 
                  ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white' 
                  : 'bg-dark-700/80 text-gray-300'
              }`}>
                第 {publicState.turnNumber} 回合 · {currentPlayer?.name} 的回合
              </div>
            </div>
          </div>

          <div className="relative h-[60vh]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] max-w-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-700/50 to-amber-900/50 border-4 border-amber-600/30 shadow-2xl">
                <div className="absolute inset-4 rounded-2xl border-2 border-amber-500/20">
                  <div className="absolute top-4 left-4 text-amber-400/50 text-sm">三国杀</div>
                  <div className="absolute bottom-4 right-4 text-amber-400/50 text-sm">Online</div>
                  
                  <div className="absolute top-1/2 left-8 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-20 h-28 bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg border-2 border-amber-500 shadow-lg flex items-center justify-center">
                        <div className="text-4xl">🃏</div>
                      </div>
                      <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-amber-400">
                        牌堆 ({publicState.deckCount})
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 right-8 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-20 h-28 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg border-2 border-gray-500 shadow-lg flex items-center justify-center">
                        <div className="text-4xl">🗑️</div>
                      </div>
                      <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-amber-400">
                        弃牌 ({publicState.discardPileCount})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {publicState.players.map((player, index) => {
              const position = getPlayerPosition(index, publicState.players.length);
              const isMe = player.id === user.id;
              const isCurrent = isCurrentPlayer(index);
              
              return (
                <div
                  key={player.id}
                  className={`absolute ${
                    position === 'top' ? 'top-0 left-1/2 -translate-x-1/2' :
                    position === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2' :
                    position === 'left' ? 'left-0 top-1/2 -translate-y-1/2' :
                    'right-0 top-1/2 -translate-y-1/2'
                  } z-10`}
                >
                  <div className={`relative p-4 rounded-2xl border-2 ${
                    isCurrent 
                      ? 'border-primary-500 bg-primary-500/20 shadow-lg shadow-primary-500/30' 
                      : isMe
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-dark-600 bg-dark-800/80'
                  } transition-all`}>
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-sm rounded-full font-bold">
                        当前回合
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        isMe 
                          ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white' 
                          : 'bg-gradient-to-br from-dark-600 to-dark-700 text-gray-300'
                      }`}>
                        {player.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${isMe ? 'text-accent-400' : 'text-white'}`}>
                            {player.name}
                            {isMe && ' (你)'}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: player.maxHealth }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                i < player.health 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-dark-600 text-gray-600'
                              }`}
                            >
                              ❤
                            </div>
                          ))}
                          <span className="text-gray-400 text-sm ml-2">
                            {player.health}/{player.maxHealth}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {player.equipment.negativeMount && (
                            <div className="w-8 h-10 bg-gray-600/50 rounded border border-gray-500 flex items-center justify-center text-sm" title={player.equipment.negativeMount.name}>
                              {getEquipmentIcon(player.equipment.negativeMount.type)}
                            </div>
                          )}
                          {player.equipment.weapon && (
                            <div className="w-8 h-10 bg-orange-600/50 rounded border border-orange-500 flex items-center justify-center text-sm" title={player.equipment.weapon.name}>
                              {getEquipmentIcon(player.equipment.weapon.type)}
                            </div>
                          )}
                          {player.equipment.armor && (
                            <div className="w-8 h-10 bg-purple-600/50 rounded border border-purple-500 flex items-center justify-center text-sm" title={player.equipment.armor.name}>
                              {getEquipmentIcon(player.equipment.armor.type)}
                            </div>
                          )}
                          {player.equipment.positiveMount && (
                            <div className="w-8 h-10 bg-yellow-600/50 rounded border border-yellow-500 flex items-center justify-center text-sm" title={player.equipment.positiveMount.name}>
                              {getEquipmentIcon(player.equipment.positiveMount.type)}
                            </div>
                          )}
                          
                          <div className="ml-auto flex items-center gap-2">
                            <div className="w-10 h-14 bg-dark-700 rounded border border-dark-500 flex items-center justify-center">
                              <span className="text-gray-400 font-bold">{player.handCardCount}</span>
                            </div>
                            <span className="text-gray-500 text-xs">手牌</span>
                          </div>
                        </div>
                      </div>

                      {isMyTurn && !isMe && (
                        <button
                          onClick={() => selectTarget(player.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTarget === player.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                          }`}
                        >
                          {selectedTarget === player.id ? '已选择' : '选为目标'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-dark-900 via-dark-900/95 to-transparent pt-12 pb-6 px-4">
            <div className="max-w-6xl mx-auto">
              {isMyTurn && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-primary-400 font-semibold">你的回合 - 选择一张手牌使用</span>
                  <button
                    onClick={endTurn}
                    className="px-6 py-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-blue-600 transition-all"
                  >
                    结束回合
                  </button>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2">
                {privateState?.handCards.map(card => (
                  <div
                    key={card.id}
                    className={`w-20 h-28 rounded-lg border-2 p-2 flex flex-col justify-between cursor-pointer transition-all transform hover:scale-105 ${
                      getCardColor(card.type)
                    } ${selectedCard?.id === card.id ? 'ring-4 ring-primary-500 scale-110' : ''} ${
                      !isMyTurn ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => selectCard(card)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs opacity-70">{card.suit}</span>
                      <span className="text-xs opacity-70">{card.value}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xl">{getCardIcon(card.type)}</div>
                      <div className="text-sm font-bold mt-1">{card.name}</div>
                    </div>
                  </div>
                ))}
                {(!privateState?.handCards || privateState.handCards.length === 0) && (
                  <div className="w-20 h-28 rounded-lg border-2 border-dashed border-dark-600 flex items-center justify-center text-gray-500">
                    无手牌
                  </div>
                )}
              </div>

              {selectedCard && (
                <div className="mt-4 p-4 bg-dark-800/80 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-16 rounded-lg border-2 p-2 flex flex-col justify-center ${getCardColor(selectedCard.type)}`}>
                        <div className="text-center">
                          <div className="text-lg">{getCardIcon(selectedCard.type)}</div>
                          <div className="text-xs font-bold">{selectedCard.name}</div>
                        </div>
                      </div>
                      <div>
                        <span className="text-white font-bold">已选择：【{selectedCard.name}】</span>
                        {selectedCard.description && (
                          <p className="text-gray-500 text-xs mt-1">{selectedCard.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedCard(null); setSelectedTarget(null); }}
                      className="text-gray-400 hover:text-white"
                    >
                      取消选择
                    </button>
                  </div>
                  {(selectedCard.type === 'attack' || selectedCard.type === 'trick_take') && !selectedTarget ? (
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400">请选择目标：</span>
                      <div className="flex gap-2">
                        {publicState.players.filter(p => p.id !== user.id && p.health > 0).map(player => (
                          <button
                            key={player.id}
                            onClick={() => selectTarget(player.id)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              selectedTarget === player.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                            }`}
                          >
                            {player.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={playCard}
                      className="w-full py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold"
                    >
                      使用【{selectedCard.name}】
                      {selectedTarget && (
                        <span className="ml-2">→ {publicState.players.find(p => p.id === selectedTarget)?.name}</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="fixed left-4 bottom-48 w-64 max-h-64 overflow-hidden">
            <div className="bg-dark-900/90 rounded-xl border border-dark-700 p-3">
              <h3 className="text-white font-semibold text-sm mb-2">游戏日志</h3>
              <div className="h-48 overflow-y-auto space-y-1 text-xs" ref={logsEndRef}>
                {publicState.logs.slice(-10).map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      index === publicState.logs.slice(-10).length - 1
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-dark-800/50 text-gray-500'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
