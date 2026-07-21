const { v4: uuidv4 } = require('uuid');

const CARD_TYPES = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  HEAL: 'heal',
  WEAPON: 'weapon',
  ARMOR: 'armor',
  MOUNT_POSITIVE: 'mount_positive',
  MOUNT_NEGATIVE: 'mount_negative',
  TRICK_TAKE: 'trick_take',
  TRICK_DESTROY: 'trick_destroy',
  TRICK_DRAW: 'trick_draw',
  TRICK_ATTACK_ALL: 'trick_attack_all',
  TRICK_DEFEND_ALL: 'trick_defend_all',
};

const CARD_NAMES = {
  ATTACK: '杀',
  DEFEND: '闪',
  HEAL: '桃',
};

const WEAPON_CARDS = [
  { name: '青龙偃月刀', attackRange: 3, description: '当你使用的【杀】被【闪】抵消时，你可以对相同目标使用一张【杀】' },
  { name: '丈八蛇矛', attackRange: 3, description: '当你需要使用【杀】时，可以将两张手牌当【杀】使用' },
  { name: '方天画戟', attackRange: 4, description: '当你使用的【杀】是你的最后一张手牌时，你可以此【杀】指定至多三名角色为目标' },
  { name: '麒麟弓', attackRange: 5, description: '你使用【杀】对目标角色造成伤害时，若其装备区有坐骑牌，你可以弃掉一张坐骑牌' },
  { name: '寒冰剑', attackRange: 2, description: '你使用【杀】造成伤害时，可以防止此伤害，改为弃掉目标角色两张牌' },
];

const ARMOR_CARDS = [
  { name: '八卦阵', description: '当你需要使用【闪】时，你可以进行一次判定：若结果为红色，则视为你使用了一张【闪】' },
  { name: '仁王盾', description: '黑色的【杀】对你无效' },
];

const MOUNT_CARDS = [
  { name: '的卢', type: 'positive', description: '你计算与其他角色的距离时，始终-1' },
  { name: '绝影', type: 'positive', description: '你计算与其他角色的距离时，始终-1' },
  { name: '赤兔', type: 'positive', description: '你计算与其他角色的距离时，始终-1' },
  { name: '爪黄飞电', type: 'negative', description: '其他角色计算与你的距离时，始终+1' },
  { name: '大宛', type: 'negative', description: '其他角色计算与你的距离时，始终+1' },
];

const TRICK_CARDS = [
  { type: 'trick_take', name: '顺手牵羊', description: '对距离为1的一名角色使用。你获得其手牌、装备区或判定区里的一张牌' },
  { type: 'trick_take', name: '过河拆桥', description: '对一名角色使用。弃掉其手牌、装备区或判定区里的一张牌' },
  { type: 'trick_draw', name: '无中生有', description: '摸两张牌' },
  { type: 'trick_draw', name: '五谷丰登', description: '每名角色从牌堆顶摸一张牌' },
  { type: 'trick_attack_all', name: '南蛮入侵', description: '每名其他角色使用一张【杀】，否则受到1点伤害' },
  { type: 'trick_attack_all', name: '万箭齐发', description: '每名其他角色使用一张【闪】，否则受到1点伤害' },
  { type: 'trick_defend_all', name: '桃园结义', description: '每名角色回复1点体力' },
  { type: 'trick_defend_all', name: '铁索连环', description: '选择一至两名角色，横置或重置这些角色' },
];

const createDeck = () => {
  const deck = [];
  
  // 杀：30张
  for (let i = 0; i < 30; i++) {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.ATTACK,
      name: CARD_NAMES.ATTACK,
      suit: ['♠', '♥', '♣', '♦'][i % 4],
      value: Math.floor(i / 4) + 1,
    });
  }
  
  // 闪：15张
  for (let i = 0; i < 15; i++) {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.DEFEND,
      name: CARD_NAMES.DEFEND,
      suit: ['♠', '♥', '♣', '♦'][i % 4],
      value: Math.floor(i / 4) + 1,
    });
  }
  
  // 桃：8张
  for (let i = 0; i < 8; i++) {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.HEAL,
      name: CARD_NAMES.HEAL,
      suit: ['♠', '♥', '♣', '♦'][i % 4],
      value: Math.floor(i / 4) + 1,
    });
  }

  // 武器：7张
  WEAPON_CARDS.forEach((weapon, index) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.WEAPON,
      name: weapon.name,
      attackRange: weapon.attackRange,
      description: weapon.description,
      suit: ['♠', '♥', '♣', '♦'][index % 4],
      value: Math.floor(index / 4) + 10,
    });
  });

  // 防具：2张
  ARMOR_CARDS.forEach((armor, index) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.ARMOR,
      name: armor.name,
      description: armor.description,
      suit: ['♠', '♥', '♣', '♦'][index % 4],
      value: Math.floor(index / 4) + 10,
    });
  });

  // 坐骑：5张
  MOUNT_CARDS.forEach((mount, index) => {
    deck.push({
      id: uuidv4(),
      type: mount.type === 'positive' ? CARD_TYPES.MOUNT_POSITIVE : CARD_TYPES.MOUNT_NEGATIVE,
      name: mount.name,
      mountType: mount.type,
      description: mount.description,
      suit: ['♠', '♥', '♣', '♦'][index % 4],
      value: Math.floor(index / 4) + 10,
    });
  });

  // 锦囊牌：10张
  TRICK_CARDS.forEach((trick, index) => {
    deck.push({
      id: uuidv4(),
      type: trick.type,
      name: trick.name,
      description: trick.description,
      suit: ['♠', '♥', '♣', '♦'][index % 4],
      value: Math.floor(index / 4) + 10,
    });
  });
  
  return shuffleDeck(deck);
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

class GameEngine {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostId, hostName) {
    const roomId = uuidv4().slice(0, 8);
    this.rooms.set(roomId, {
      id: roomId,
      hostId,
      hostName,
      players: [{
        id: hostId,
        name: hostName,
        socketId: null,
        handCards: [],
        equipment: {
          weapon: null,
          armor: null,
          positiveMount: null,
          negativeMount: null,
        },
        health: 4,
        maxHealth: 4,
        isOnline: true,
        isReady: false,
      }],
      deck: [],
      discardPile: [],
      currentPlayerIndex: 0,
      gamePhase: 'waiting',
      turnNumber: 1,
      logs: [`房间创建成功！房主：${hostName}`],
    });
    return roomId;
  }

  joinRoom(roomId, playerId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.gamePhase !== 'waiting') return null;
    if (room.players.length >= 4) return null;
    if (room.players.some(p => p.id === playerId)) return null;

    room.players.push({
      id: playerId,
      name: playerName,
      socketId: null,
      handCards: [],
      equipment: {
        weapon: null,
        armor: null,
        positiveMount: null,
        negativeMount: null,
      },
      health: 4,
      maxHealth: 4,
      isOnline: true,
      isReady: false,
    });
    room.logs.push(`${playerName} 加入了房间`);
    return room;
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    room.logs.push(`${player.name} 离开了房间`);

    if (playerIndex === 0) {
      if (room.players.length > 1) {
        room.hostId = room.players[1].id;
        room.hostName = room.players[1].name;
        room.logs.push(`${room.hostName} 成为新的房主`);
      } else {
        this.rooms.delete(roomId);
        return;
      }
    }

    room.players.splice(playerIndex, 1);

    if (room.currentPlayerIndex >= room.players.length) {
      room.currentPlayerIndex = 0;
    }
  }

  setSocketId(roomId, playerId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = socketId;
      player.isOnline = true;
    }
  }

  setOffline(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.isOnline = false;
    }
  }

  toggleReady(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.isReady = !player.isReady;
    room.logs.push(`${player.name} ${player.isReady ? '已准备' : '取消准备'}`);
    return room;
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length < 2) return null;
    if (!room.players.every(p => p.isReady)) return null;

    room.deck = createDeck();
    room.discardPile = [];
    room.currentPlayerIndex = 0;
    room.gamePhase = 'playing';
    room.turnNumber = 1;

    room.players.forEach(player => {
      player.handCards = [];
      player.equipment = {
        weapon: null,
        armor: null,
        positiveMount: null,
        negativeMount: null,
      };
      player.health = player.maxHealth;
      for (let i = 0; i < 4; i++) {
        if (room.deck.length > 0) {
          player.handCards.push(room.deck.pop());
        }
      }
    });

    room.logs.push('游戏开始！');
    room.logs.push(`第 ${room.turnNumber} 回合，${room.players[0].name} 的回合`);
    return room;
  }

  playCard(roomId, playerId, cardId, targetPlayerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.gamePhase !== 'playing') return null;
    if (room.players[room.currentPlayerIndex].id !== playerId) return null;

    const player = room.players.find(p => p.id === playerId);
    const cardIndex = player.handCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    const card = player.handCards[cardIndex];
    player.handCards.splice(cardIndex, 1);

    let result = { success: true, message: '', targetDefended: false };

    if (card.type === CARD_TYPES.ATTACK) {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择攻击目标';
        player.handCards.push(card);
        return result;
      }

      const targetPlayer = room.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer) {
        result.success = false;
        result.message = '目标玩家不存在';
        player.handCards.push(card);
        return result;
      }

      room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【杀】`);
      result.targetDefended = false;
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.DEFEND) {
      room.logs.push(`${player.name} 使用了【闪】`);
      result.targetDefended = true;
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.HEAL) {
      if (player.health >= player.maxHealth) {
        result.success = false;
        result.message = '血量已满，不能使用桃';
        player.handCards.push(card);
        return result;
      }
      player.health = Math.min(player.health + 1, player.maxHealth);
      room.logs.push(`${player.name} 使用了【桃】，恢复了1点体力`);
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.WEAPON) {
      if (player.equipment.weapon) {
        room.discardPile.push(player.equipment.weapon);
      }
      player.equipment.weapon = card;
      room.logs.push(`${player.name} 装备了【${card.name}】`);
    } else if (card.type === CARD_TYPES.ARMOR) {
      if (player.equipment.armor) {
        room.discardPile.push(player.equipment.armor);
      }
      player.equipment.armor = card;
      room.logs.push(`${player.name} 装备了【${card.name}】`);
    } else if (card.type === CARD_TYPES.MOUNT_POSITIVE) {
      if (player.equipment.positiveMount) {
        room.discardPile.push(player.equipment.positiveMount);
      }
      player.equipment.positiveMount = card;
      room.logs.push(`${player.name} 装备了【${card.name}】`);
    } else if (card.type === CARD_TYPES.MOUNT_NEGATIVE) {
      if (player.equipment.negativeMount) {
        room.discardPile.push(player.equipment.negativeMount);
      }
      player.equipment.negativeMount = card;
      room.logs.push(`${player.name} 装备了【${card.name}】`);
    } else if (card.type === CARD_TYPES.TRICK_TAKE) {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择目标角色';
        player.handCards.push(card);
        return result;
      }
      const targetPlayer = room.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer) {
        result.success = false;
        result.message = '目标玩家不存在';
        player.handCards.push(card);
        return result;
      }
      if (card.name === '顺手牵羊') {
        room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【顺手牵羊】`);
        const targetCards = [...targetPlayer.handCards];
        if (targetCards.length > 0) {
          const randomCard = targetCards[Math.floor(Math.random() * targetCards.length)];
          const idx = targetPlayer.handCards.findIndex(c => c.id === randomCard.id);
          if (idx !== -1) {
            targetPlayer.handCards.splice(idx, 1);
            player.handCards.push(randomCard);
            room.logs.push(`${player.name} 获得了 ${targetPlayer.name} 的【${randomCard.name}】`);
          }
        }
      } else if (card.name === '过河拆桥') {
        room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【过河拆桥】`);
        const targetCards = [...targetPlayer.handCards];
        if (targetCards.length > 0) {
          const randomCard = targetCards[Math.floor(Math.random() * targetCards.length)];
          const idx = targetPlayer.handCards.findIndex(c => c.id === randomCard.id);
          if (idx !== -1) {
            targetPlayer.handCards.splice(idx, 1);
            room.discardPile.push(randomCard);
            room.logs.push(`${player.name} 弃掉了 ${targetPlayer.name} 的【${randomCard.name}】`);
          }
        }
      }
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.TRICK_DRAW) {
      if (card.name === '无中生有') {
        room.logs.push(`${player.name} 使用了【无中生有】`);
        for (let i = 0; i < 2; i++) {
          if (room.deck.length > 0) {
            player.handCards.push(room.deck.pop());
          }
        }
        room.logs.push(`${player.name} 摸了两张牌`);
      } else if (card.name === '五谷丰登') {
        room.logs.push(`${player.name} 使用了【五谷丰登】`);
        room.players.forEach(p => {
          if (room.deck.length > 0) {
            p.handCards.push(room.deck.pop());
          }
        });
        room.logs.push('每名角色摸了一张牌');
      }
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.TRICK_ATTACK_ALL) {
      if (card.name === '南蛮入侵') {
        room.logs.push(`${player.name} 使用了【南蛮入侵】`);
        room.players.forEach(p => {
          if (p.id !== playerId && p.health > 0) {
            const hasAttack = p.handCards.some(c => c.type === CARD_TYPES.ATTACK);
            if (!hasAttack) {
              p.health--;
              room.logs.push(`${p.name} 受到1点伤害`);
              if (p.health <= 0) {
                p.health = 0;
                room.logs.push(`${p.name} 阵亡了！`);
              }
            } else {
              room.logs.push(`${p.name} 使用【杀】抵消了南蛮入侵`);
            }
          }
        });
      } else if (card.name === '万箭齐发') {
        room.logs.push(`${player.name} 使用了【万箭齐发】`);
        room.players.forEach(p => {
          if (p.id !== playerId && p.health > 0) {
            const hasDefend = p.handCards.some(c => c.type === CARD_TYPES.DEFEND);
            if (!hasDefend) {
              p.health--;
              room.logs.push(`${p.name} 受到1点伤害`);
              if (p.health <= 0) {
                p.health = 0;
                room.logs.push(`${p.name} 阵亡了！`);
              }
            } else {
              room.logs.push(`${p.name} 使用【闪】抵消了万箭齐发`);
            }
          }
        });
      }
      room.discardPile.push(card);
      this.checkGameOver(room);
    } else if (card.type === CARD_TYPES.TRICK_DEFEND_ALL) {
      if (card.name === '桃园结义') {
        room.logs.push(`${player.name} 使用了【桃园结义】`);
        room.players.forEach(p => {
          if (p.health > 0 && p.health < p.maxHealth) {
            p.health++;
            room.logs.push(`${p.name} 恢复了1点体力`);
          }
        });
      }
      room.discardPile.push(card);
    }

    this.checkGameOver(room);
    return result;
  }

  takeDamage(roomId, targetPlayerId, amount = 1) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const targetPlayer = room.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return null;

    targetPlayer.health -= amount;
    room.logs.push(`${targetPlayer.name} 受到了 ${amount} 点伤害，当前体力：${targetPlayer.health}`);

    if (targetPlayer.health <= 0) {
      targetPlayer.health = 0;
      room.logs.push(`${targetPlayer.name} 阵亡了！`);
      this.checkGameOver(room);
    }

    return room;
  }

  endTurn(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.gamePhase !== 'playing') return null;
    if (room.players[room.currentPlayerIndex].id !== playerId) return null;

    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

    if (room.currentPlayerIndex === 0) {
      room.turnNumber++;
      room.logs.push(`第 ${room.turnNumber} 回合开始`);
    }

    const currentPlayer = room.players[room.currentPlayerIndex];
    room.logs.push(`${currentPlayer.name} 的回合`);

    for (let i = 0; i < 2; i++) {
      if (room.deck.length > 0) {
        currentPlayer.handCards.push(room.deck.pop());
      }
    }

    return room;
  }

  checkGameOver(room) {
    const alivePlayers = room.players.filter(p => p.health > 0);
    if (alivePlayers.length <= 1) {
      room.gamePhase = 'ended';
      if (alivePlayers.length === 1) {
        room.logs.push(`游戏结束！${alivePlayers[0].name} 获胜！`);
      } else {
        room.logs.push('游戏结束！平局！');
      }
    }
  }

  getPublicState(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      hostName: room.hostName,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        health: p.health,
        maxHealth: p.maxHealth,
        handCardCount: p.handCards.length,
        isOnline: p.isOnline,
        isReady: p.isReady,
        socketId: p.socketId,
        equipment: {
          weapon: p.equipment.weapon ? { name: p.equipment.weapon.name, type: p.equipment.weapon.type } : null,
          armor: p.equipment.armor ? { name: p.equipment.armor.name, type: p.equipment.armor.type } : null,
          positiveMount: p.equipment.positiveMount ? { name: p.equipment.positiveMount.name, type: p.equipment.positiveMount.type } : null,
          negativeMount: p.equipment.negativeMount ? { name: p.equipment.negativeMount.name, type: p.equipment.negativeMount.type } : null,
        },
      })),
      currentPlayerIndex: room.currentPlayerIndex,
      gamePhase: room.gamePhase,
      turnNumber: room.turnNumber,
      logs: room.logs,
      discardPileCount: room.discardPile.length,
      deckCount: room.deck.length,
    };
  }

  getPrivateState(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    return {
      handCards: player.handCards,
      isMyTurn: room.players[room.currentPlayerIndex].id === playerId,
    };
  }

  getAllRooms() {
    const result = [];
    this.rooms.forEach(room => {
      result.push({
        id: room.id,
        hostName: room.hostName,
        playerCount: room.players.length,
        maxPlayers: 4,
        gamePhase: room.gamePhase,
      });
    });
    return result;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

module.exports = { GameEngine };
