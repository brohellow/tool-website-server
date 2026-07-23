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
  TRICK_DRAW: 'trick_draw',
  TRICK_ATTACK_ALL: 'trick_attack_all',
  TRICK_DEFEND_ALL: 'trick_defend_all',
  TRICK_DUEL: 'trick_duel',
  TRICK_DELAYED: 'trick_delayed',
  TRICK_COUNTER: 'trick_counter',
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
  { name: '雌雄双股剑', attackRange: 2, description: '你使用【杀】指定一名异性角色为目标后，你可以令其选择一项：1. 弃一张手牌；2. 让你摸一张牌' },
  { name: '贯石斧', attackRange: 3, description: '当你使用的【杀】被【闪】抵消时，你可以弃两张牌，令此【杀】仍然造成伤害' },
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
  { type: 'trick_duel', name: '决斗', description: '对一名角色使用。由你开始，你和目标角色轮流打出一张【杀】。首先不出【杀】的角色受到1点伤害' },
  { type: 'trick_delayed', name: '乐不思蜀', description: '延时锦囊。对一名角色使用，将此牌置于其判定区。其回合开始阶段进行判定：若结果不为红桃，则跳过其出牌阶段' },
  { type: 'trick_delayed', name: '闪电', description: '延时锦囊。此牌置于你的判定区。你的回合开始阶段进行判定：若结果为黑桃2~9，则你受到3点伤害，将此牌弃置；否则将此牌移动到下一名角色的判定区' },
  { type: 'trick_counter', name: '无懈可击', description: '在锦囊牌生效前，你可以打出此牌抵消该锦囊牌的效果' },
];

const WARRIORS = [
  { id: 'w1', name: '刘备', title: '仁德', hp: 3, skill: '仁德', skillDesc: '出牌阶段，你可以将任意数量的手牌交给其他角色，若给出的牌不少于两张，你回复1点体力', icon: '刘' },
  { id: 'w2', name: '关羽', title: '武圣', hp: 3, skill: '武圣', skillDesc: '你可以将一张红色牌当【杀】使用或打出', icon: '关' },
  { id: 'w3', name: '张飞', title: '咆哮', hp: 4, skill: '咆哮', skillDesc: '出牌阶段，你可以使用任意数量的【杀】', icon: '张' },
  { id: 'w4', name: '赵云', title: '龙胆', hp: 4, skill: '龙胆', skillDesc: '你可以将一张杀当【闪】使用或打出，或将一张闪当【杀】使用或打出', icon: '赵' },
  { id: 'w5', name: '马超', title: '铁骑', hp: 4, skill: '铁骑', skillDesc: '当你使用【杀】指定一名角色为目标后，你可以进行判定，若结果为红色，该角色不能使用【闪】响应此【杀】', icon: '马' },
  { id: 'w6', name: '黄忠', title: '烈弓', hp: 4, skill: '烈弓', skillDesc: '当你使用【杀】指定一名角色为目标后，若该角色的手牌数大于你的手牌数，你可以进行判定，若结果为红色，该角色不能使用【闪】响应此【杀】', icon: '黄' },
  { id: 'w7', name: '诸葛亮', title: '观星', hp: 3, skill: '观星', skillDesc: '准备阶段，你可以观看牌堆顶的X张牌（X为存活角色数且最多为5），将其中任意数量的牌以任意顺序置于牌堆顶，其余以任意顺序置于牌堆底', icon: '诸' },
  { id: 'w8', name: '庞统', title: '连环', hp: 3, skill: '连环', skillDesc: '当你使用【铁索连环】指定目标后，你可以选择一项：1. 重铸一张手牌；2. 摸一张牌', icon: '庞' },
  { id: 'w9', name: '曹操', title: '奸雄', hp: 4, skill: '奸雄', skillDesc: '当你受到伤害后，你可以获得造成伤害的牌', icon: '曹' },
  { id: 'w10', name: '司马懿', title: '反馈', hp: 3, skill: '反馈', skillDesc: '当你受到伤害后，你可以获得伤害来源的一张牌', icon: '司' },
  { id: 'w11', name: '夏侯惇', title: '刚烈', hp: 4, skill: '刚烈', skillDesc: '当你受到伤害后，你可以进行判定，若结果不为红桃，伤害来源选择一项：1. 弃两张手牌；2. 受到你造成的1点伤害', icon: '夏' },
  { id: 'w12', name: '张辽', title: '突袭', hp: 4, skill: '突袭', skillDesc: '摸牌阶段，你可以放弃摸牌，改为获得两名其他角色的各一张手牌', icon: '张' },
  { id: 'w13', name: '孙权', title: '制衡', hp: 4, skill: '制衡', skillDesc: '出牌阶段限一次，你可以弃置任意数量的手牌，然后摸等量的牌', icon: '孙' },
  { id: 'w14', name: '甘宁', title: '奇袭', hp: 4, skill: '奇袭', skillDesc: '你可以将一张黑色牌当【过河拆桥】使用', icon: '甘' },
  { id: 'w15', name: '吕蒙', title: '克己', hp: 4, skill: '克己', skillDesc: '若你于出牌阶段未使用或打出过【杀】，你可以跳过弃牌阶段', icon: '吕' },
  { id: 'w16', name: '黄盖', title: '苦肉', hp: 4, skill: '苦肉', skillDesc: '出牌阶段限一次，你可以失去1点体力，然后摸两张牌', icon: '黄' },
  { id: 'w17', name: '周瑜', title: '英姿', hp: 3, skill: '英姿', skillDesc: '摸牌阶段，你可以多摸一张牌', icon: '周' },
  { id: 'w18', name: '陆逊', title: '谦逊', hp: 3, skill: '谦逊', skillDesc: '你不能成为【顺手牵羊】和【乐不思蜀】的目标', icon: '陆' },
  { id: 'w19', name: '华佗', title: '青囊', hp: 3, skill: '青囊', skillDesc: '出牌阶段限一次，你可以弃置一张手牌并选择一名受伤的角色，令其回复1点体力', icon: '华' },
  { id: 'w20', name: '吕布', title: '无双', hp: 4, skill: '无双', skillDesc: '锁定技，当你使用【杀】指定一名角色为目标后，该角色需使用两张【闪】才能抵消；当你使用【决斗】指定一名角色为目标后，或成为【决斗】的目标时，你每次需要打出两张【杀】', icon: '吕' },
];

const SUITS = ['♠', '♥', '♣', '♦'];
const SUIT_COLORS = {
  '♠': 'black',
  '♥': 'red',
  '♣': 'black',
  '♦': 'red',
};

const createDeck = () => {
  const deck = [];
  
  // 基本牌 - 标准三国杀配置
  // 杀：30张（黑桃7张、红桃3张、梅花7张、方块3张 + 4种花色各2张 = 30张）
  const attackCards = [
    ...generateCards(7, '♠'),
    ...generateCards(3, '♥'),
    ...generateCards(7, '♣'),
    ...generateCards(3, '♦'),
    ...generateCards(2, '♠'),
    ...generateCards(2, '♥'),
    ...generateCards(2, '♣'),
    ...generateCards(4, '♦'),
  ];
  attackCards.forEach((card, i) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.ATTACK,
      name: CARD_NAMES.ATTACK,
      suit: card.suit,
      value: card.value,
      color: SUIT_COLORS[card.suit],
    });
  });
  
  // 闪：15张（红桃6张、方块9张）
  const defendCards = [
    ...generateCards(6, '♥'),
    ...generateCards(9, '♦'),
  ];
  defendCards.forEach((card, i) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.DEFEND,
      name: CARD_NAMES.DEFEND,
      suit: card.suit,
      value: card.value,
      color: SUIT_COLORS[card.suit],
    });
  });
  
  // 桃：8张（红桃7张、方块1张）
  const healCards = [
    ...generateCards(7, '♥'),
    ...generateCards(1, '♦'),
  ];
  healCards.forEach((card, i) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.HEAL,
      name: CARD_NAMES.HEAL,
      suit: card.suit,
      value: card.value,
      color: SUIT_COLORS[card.suit],
    });
  });

  // 武器：7张
  const weaponSuits = ['♠', '♣', '♠', '♣', '♦', '♥', '♣'];
  WEAPON_CARDS.forEach((weapon, index) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.WEAPON,
      name: weapon.name,
      attackRange: weapon.attackRange,
      description: weapon.description,
      suit: weaponSuits[index],
      value: 10 + index,
      color: SUIT_COLORS[weaponSuits[index]],
    });
  });

  // 防具：2张
  const armorSuits = ['♣', '♠'];
  ARMOR_CARDS.forEach((armor, index) => {
    deck.push({
      id: uuidv4(),
      type: CARD_TYPES.ARMOR,
      name: armor.name,
      description: armor.description,
      suit: armorSuits[index],
      value: 10 + index,
      color: SUIT_COLORS[armorSuits[index]],
    });
  });

  // 坐骑：5张
  const mountSuits = ['♥', '♦', '♠', '♠', '♣'];
  MOUNT_CARDS.forEach((mount, index) => {
    deck.push({
      id: uuidv4(),
      type: mount.type === 'positive' ? CARD_TYPES.MOUNT_POSITIVE : CARD_TYPES.MOUNT_NEGATIVE,
      name: mount.name,
      mountType: mount.type,
      description: mount.description,
      suit: mountSuits[index],
      value: 10 + index,
      color: SUIT_COLORS[mountSuits[index]],
    });
  });

  // 锦囊牌
  const trickSuits = ['♠', '♠', '♥', '♥', '♠', '♥', '♦', '♦', '♠', '♠', '♣', '♠', '♦', '♠'];
  TRICK_CARDS.forEach((trick, index) => {
    deck.push({
      id: uuidv4(),
      type: trick.type,
      name: trick.name,
      description: trick.description,
      suit: trickSuits[index],
      value: 10 + index,
      color: SUIT_COLORS[trickSuits[index]],
    });
  });
  
  return shuffleDeck(deck);
};

function generateCards(count, suit) {
  const cards = [];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  for (let i = 0; i < count; i++) {
    cards.push({
      suit,
      value: values[i % values.length],
    });
  }
  return cards;
}

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
        warrior: null,
        hasSelectedWarrior: false,
        attackCount: 0,
        hasUsedAttackThisTurn: false,
        hasUsedSkillThisTurn: false,
        givenCardsCount: 0,
        delayedEffects: [],
        isLocked: false,
        isChained: false,
      }],
      deck: [],
      discardPile: [],
      currentPlayerIndex: 0,
      gamePhase: 'waiting',
      turnNumber: 1,
      logs: [`房间创建成功！房主：${hostName}`],
      availableWarriors: [],
      turnPhase: 'draw',
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
      warrior: null,
      hasSelectedWarrior: false,
      attackCount: 0,
      hasUsedAttackThisTurn: false,
      hasUsedSkillThisTurn: false,
      givenCardsCount: 0,
      delayedEffects: [],
      isLocked: false,
      isChained: false,
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

    const shuffledWarriors = shuffleDeck([...WARRIORS]);
    room.availableWarriors = shuffledWarriors.slice(0, room.players.length * 3);

    room.players.forEach(player => {
      player.handCards = [];
      player.equipment = {
        weapon: null,
        armor: null,
        positiveMount: null,
        negativeMount: null,
      };
      player.health = 4;
      player.maxHealth = 4;
      player.warrior = null;
      player.hasSelectedWarrior = false;
      player.attackCount = 0;
      player.hasUsedAttackThisTurn = false;
      player.hasUsedSkillThisTurn = false;
      player.givenCardsCount = 0;
      player.delayedEffects = [];
      player.isLocked = false;
      player.isChained = false;
    });

    room.deck = createDeck();
    room.discardPile = [];
    room.currentPlayerIndex = 0;
    room.gamePhase = 'selecting_warrior';
    room.turnNumber = 1;
    room.turnPhase = 'draw';

    room.logs.push('进入选将阶段！');
    room.logs.push('每位玩家请选择一名武将');
    return room;
  }

  selectWarrior(roomId, playerId, warriorId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.gamePhase !== 'selecting_warrior') return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;
    if (player.hasSelectedWarrior) return null;

    const warrior = WARRIORS.find(w => w.id === warriorId);
    if (!warrior) return null;

    player.warrior = warrior;
    player.health = warrior.hp;
    player.maxHealth = warrior.hp;
    player.hasSelectedWarrior = true;

    room.logs.push(`${player.name} 选择了武将【${warrior.name}】(${warrior.skill})`);

    const allSelected = room.players.every(p => p.hasSelectedWarrior);
    if (allSelected) {
      this.startPlaying(roomId);
    }

    return room;
  }

  startPlaying(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.gamePhase = 'playing';

    room.players.forEach(player => {
      player.handCards = [];
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

  getDistance(room, fromPlayer, toPlayer) {
    const fromIndex = room.players.findIndex(p => p.id === fromPlayer.id);
    const toIndex = room.players.findIndex(p => p.id === toPlayer.id);
    let distance = Math.min(
      Math.abs(toIndex - fromIndex),
      room.players.length - Math.abs(toIndex - fromIndex)
    );
    
    if (fromPlayer.equipment.positiveMount) {
      distance -= 1;
    }
    if (toPlayer.equipment.negativeMount) {
      distance += 1;
    }
    
    return Math.max(1, distance);
  }

  canAttackTarget(room, attacker, target) {
    const attackRange = attacker.equipment.weapon ? attacker.equipment.weapon.attackRange : 1;
    const distance = this.getDistance(room, attacker, target);
    return distance <= attackRange;
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

    let result = { success: true, message: '', targetDefended: false, cardUsed: card };

    if (player.warrior?.skill === '仁德') {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择要给予手牌的角色';
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
      targetPlayer.handCards.push(card);
      room.logs.push(`${player.name} 将【${card.name}】交给了${targetPlayer.name}`);
      const givenCount = player.givenCardsCount ? player.givenCardsCount + 1 : 1;
      player.givenCardsCount = givenCount;
      if (givenCount >= 2 && player.health < player.maxHealth) {
        player.health++;
        room.logs.push(`${player.name} 发动仁德，回复了1点体力`);
      }
      return result;
    }

    if (player.warrior?.skill === '苦肉') {
      if (player.hasUsedSkillThisTurn) {
        result.success = false;
        result.message = '本回合已使用过苦肉';
        player.handCards.push(card);
        return result;
      }
      if (player.health <= 1) {
        result.success = false;
        result.message = '体力不足，无法使用苦肉';
        player.handCards.push(card);
        return result;
      }
      player.health--;
      player.hasUsedSkillThisTurn = true;
      room.logs.push(`${player.name} 发动苦肉，失去1点体力`);
      for (let i = 0; i < 2; i++) {
        if (room.deck.length > 0) {
          player.handCards.push(room.deck.pop());
        }
      }
      room.logs.push(`${player.name} 摸了两张牌`);
      return result;
    }

    if (player.warrior?.skill === '青囊') {
      if (player.hasUsedSkillThisTurn) {
        result.success = false;
        result.message = '本回合已使用过青囊';
        player.handCards.push(card);
        return result;
      }
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择受伤的角色';
        player.handCards.push(card);
        return result;
      }
      const targetPlayer = room.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer || targetPlayer.health >= targetPlayer.maxHealth) {
        result.success = false;
        result.message = '目标玩家不存在或未受伤';
        player.handCards.push(card);
        return result;
      }
      player.hasUsedSkillThisTurn = true;
      targetPlayer.health++;
      room.logs.push(`${player.name} 发动青囊，令${targetPlayer.name}恢复了1点体力`);
      room.discardPile.push(card);
      return result;
    }

    if (player.warrior?.skill === '制衡') {
      if (player.hasUsedSkillThisTurn) {
        result.success = false;
        result.message = '本回合已使用过制衡';
        player.handCards.push(card);
        return result;
      }
      player.hasUsedSkillThisTurn = true;
      const discardCount = player.handCards.length + 1;
      player.handCards.forEach(c => room.discardPile.push(c));
      player.handCards = [];
      for (let i = 0; i < discardCount; i++) {
        if (room.deck.length > 0) {
          player.handCards.push(room.deck.pop());
        }
      }
      room.logs.push(`${player.name} 发动制衡，弃掉${discardCount}张牌，摸了${discardCount}张牌`);
      return result;
    }

    if (player.warrior?.skill === '奇袭' && card.color === 'black') {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择过河拆桥的目标';
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
      room.logs.push(`${player.name} 将【${card.name}】当【过河拆桥】使用`);
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
      room.discardPile.push(card);
      return result;
    }

    const isUsingAsAttack = (card.type === CARD_TYPES.ATTACK) ||
      (player.warrior?.skill === '武圣' && card.color === 'red') ||
      (player.warrior?.skill === '龙胆' && card.type === CARD_TYPES.DEFEND);

    const isUsingAsDefend = (card.type === CARD_TYPES.DEFEND) ||
      (player.warrior?.skill === '龙胆' && card.type === CARD_TYPES.ATTACK);

    if (isUsingAsAttack) {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择攻击目标';
        player.handCards.push(card);
        return result;
      }

      const targetPlayer = room.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer || targetPlayer.health <= 0) {
        result.success = false;
        result.message = '目标玩家不存在或已阵亡';
        player.handCards.push(card);
        return result;
      }

      if (!this.canAttackTarget(room, player, targetPlayer)) {
        result.success = false;
        result.message = '目标距离太远';
        player.handCards.push(card);
        return result;
      }

      if (player.hasUsedAttackThisTurn && !player.warrior?.skill?.includes('咆哮')) {
        result.success = false;
        result.message = '本回合已使用过杀';
        player.handCards.push(card);
        return result;
      }

      player.hasUsedAttackThisTurn = true;
      player.attackCount++;

      const attackCardName = card.type === CARD_TYPES.ATTACK ? '【杀】' : `【${card.name}】当作【杀】`;
      if (player.warrior?.skill === '武圣') {
        room.logs.push(`${player.name} 发动武圣，将${attackCardName}使用`);
      } else if (player.warrior?.skill === '龙胆') {
        room.logs.push(`${player.name} 发动龙胆，将${attackCardName}使用`);
      } else {
        room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【杀】`);
      }
      
      this.resolveAttack(room, player, targetPlayer, card);
      room.discardPile.push(card);
    } else if (isUsingAsDefend) {
      if (player.warrior?.skill === '龙胆') {
        room.logs.push(`${player.name} 发动龙胆，将【${card.name}】当作【闪】使用`);
      } else {
        room.logs.push(`${player.name} 使用了【闪】`);
      }
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
        if (targetPlayer.warrior?.skill === '谦逊') {
          result.success = false;
          result.message = `${targetPlayer.name} 的谦逊使其不能成为顺手牵羊的目标`;
          player.handCards.push(card);
          return result;
        }
        const distance = this.getDistance(room, player, targetPlayer);
        if (distance > 1) {
          result.success = false;
          result.message = '目标距离太远';
          player.handCards.push(card);
          return result;
        }
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
              this.dealDamage(room, p, 1);
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
              this.dealDamage(room, p, 1);
            } else {
              room.logs.push(`${p.name} 使用【闪】抵消了万箭齐发`);
            }
          }
        });
      }
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.TRICK_DEFEND_ALL) {
      if (card.name === '桃园结义') {
        room.logs.push(`${player.name} 使用了【桃园结义】`);
        room.players.forEach(p => {
          if (p.health > 0 && p.health < p.maxHealth) {
            p.health++;
            room.logs.push(`${p.name} 恢复了1点体力`);
          }
        });
      } else if (card.name === '铁索连环') {
        room.logs.push(`${player.name} 使用了【铁索连环】`);
        if (!targetPlayerId) {
          room.logs.push(`${player.name} 重铸了【铁索连环】`);
          if (room.deck.length > 0) {
            player.handCards.push(room.deck.pop());
          }
        } else {
          const targetPlayer = room.players.find(p => p.id === targetPlayerId);
          if (targetPlayer) {
            targetPlayer.isChained = !targetPlayer.isChained;
            room.logs.push(`${targetPlayer.name} ${targetPlayer.isChained ? '被横置' : '被重置'}`);
          }
        }
        if (player.warrior?.skill === '连环') {
          room.logs.push(`${player.name} 发动连环，摸一张牌`);
          if (room.deck.length > 0) {
            player.handCards.push(room.deck.pop());
          }
        }
      }
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.TRICK_DUEL) {
      if (!targetPlayerId) {
        result.success = false;
        result.message = '请选择决斗目标';
        player.handCards.push(card);
        return result;
      }
      const targetPlayer = room.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer || targetPlayer.health <= 0) {
        result.success = false;
        result.message = '目标玩家不存在或已阵亡';
        player.handCards.push(card);
        return result;
      }
      room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【决斗】`);
      this.resolveDuel(room, player, targetPlayer);
      room.discardPile.push(card);
    } else if (card.type === CARD_TYPES.TRICK_DELAYED) {
      if (card.name === '乐不思蜀') {
        if (!targetPlayerId) {
          result.success = false;
          result.message = '请选择目标角色';
          player.handCards.push(card);
          return result;
        }
        const targetPlayer = room.players.find(p => p.id === targetPlayerId);
        if (!targetPlayer || targetPlayer.health <= 0) {
          result.success = false;
          result.message = '目标玩家不存在或已阵亡';
          player.handCards.push(card);
          return result;
        }
        if (targetPlayer.warrior?.skill === '谦逊') {
          result.success = false;
          result.message = `${targetPlayer.name} 的谦逊使其不能成为乐不思蜀的目标`;
          player.handCards.push(card);
          return result;
        }
        targetPlayer.delayedEffects.push({
          type: 'locked',
          name: '乐不思蜀',
        });
        room.logs.push(`${player.name} 对 ${targetPlayer.name} 使用了【乐不思蜀】`);
        room.discardPile.push(card);
      } else if (card.name === '闪电') {
        player.delayedEffects.push({
          type: 'lightning',
          name: '闪电',
        });
        room.logs.push(`${player.name} 使用了【闪电】`);
        room.discardPile.push(card);
      }
    } else if (card.type === CARD_TYPES.TRICK_COUNTER) {
      if (card.name === '无懈可击') {
        room.logs.push(`${player.name} 使用了【无懈可击】`);
        room.discardPile.push(card);
        if (room.pendingTrick) {
          room.logs.push(`${player.name} 抵消了${room.pendingTrick.card.name}的效果`);
          room.pendingTrick = null;
        } else {
          room.logs.push(`${player.name} 使用【无懈可击】但没有可以抵消的锦囊`);
        }
      }
    }

    this.checkGameOver(room);
    return result;
  }

  resolveAttack(room, attacker, target, card) {
    const targetHasDefend = target.handCards.some(c => c.type === CARD_TYPES.DEFEND);
    const targetHasShield = target.equipment.armor?.name === '八卦阵';
    const targetHasRenwang = target.equipment.armor?.name === '仁王盾';
    
    let needsTwoDefend = attacker.warrior?.skill?.includes('无双');
    let defendCount = 0;
    let defended = false;
    let cannotDefend = false;

    if (targetHasRenwang && card.color === 'black') {
      room.logs.push(`${target.name} 的仁王盾使黑色【杀】无效`);
      defended = true;
      return;
    }

    if (attacker.warrior?.skill === '铁骑') {
      const roll = Math.floor(Math.random() * 13) + 1;
      const isRed = roll >= 1 && roll <= 6;
      room.logs.push(`${attacker.name} 发动铁骑，判定结果：${roll}`);
      if (isRed) {
        room.logs.push(`${target.name} 不能使用【闪】`);
        cannotDefend = true;
      }
    } else if (attacker.warrior?.skill === '烈弓') {
      if (target.handCards.length > attacker.handCards.length) {
        const roll = Math.floor(Math.random() * 13) + 1;
        const isRed = roll >= 1 && roll <= 6;
        room.logs.push(`${attacker.name} 发动烈弓，判定结果：${roll}`);
        if (isRed) {
          room.logs.push(`${target.name} 不能使用【闪】`);
          cannotDefend = true;
        }
      }
    }

    if (needsTwoDefend) {
      room.logs.push(`${target.name} 需要使用两张【闪】才能抵消`);
      if (!cannotDefend && targetHasDefend) {
        defendCount = 2;
        if (target.handCards.filter(c => c.type === CARD_TYPES.DEFEND).length >= 2) {
          defended = true;
          room.logs.push(`${target.name} 使用两张【闪】抵消了【杀】`);
        }
      }
    } else {
      if (!cannotDefend && targetHasDefend) {
        defendCount = 1;
        defended = true;
        room.logs.push(`${target.name} 使用【闪】抵消了【杀】`);
      } else if (!cannotDefend && targetHasShield) {
        const roll = Math.random() > 0.5;
        if (roll) {
          defended = true;
          room.logs.push(`${target.name} 发动八卦阵，判定成功，抵消了【杀】`);
        }
      }
    }

    if (!defended) {
      this.resolveWeaponEffect(room, attacker, target, card);
      this.dealDamage(room, target, 1, attacker);
    } else {
      this.resolveWeaponDefendedEffect(room, attacker, target, card);
    }
  }

  resolveWeaponEffect(room, attacker, target, card) {
    const weapon = attacker.equipment.weapon;
    if (!weapon) return;

    if (weapon.name === '寒冰剑') {
      room.logs.push(`${attacker.name} 发动寒冰剑效果`);
      for (let i = 0; i < 2; i++) {
        if (target.handCards.length > 0) {
          const randomCard = target.handCards[Math.floor(Math.random() * target.handCards.length)];
          const idx = target.handCards.findIndex(c => c.id === randomCard.id);
          if (idx !== -1) {
            target.handCards.splice(idx, 1);
            room.discardPile.push(randomCard);
          }
        }
      }
    } else if (weapon.name === '麒麟弓') {
      if (target.equipment.positiveMount || target.equipment.negativeMount) {
        room.logs.push(`${attacker.name} 发动麒麟弓效果`);
        if (target.equipment.positiveMount) {
          room.discardPile.push(target.equipment.positiveMount);
          target.equipment.positiveMount = null;
        } else if (target.equipment.negativeMount) {
          room.discardPile.push(target.equipment.negativeMount);
          target.equipment.negativeMount = null;
        }
      }
    } else if (weapon.name === '方天画戟') {
      if (attacker.handCards.length === 0) {
        room.logs.push(`${attacker.name} 发动方天画戟效果，此【杀】可指定至多三名角色`);
        room.players.forEach(p => {
          if (p.id !== attacker.id && p.health > 0) {
            this.dealDamage(room, p, 1, attacker);
          }
        });
      }
    } else if (weapon.name === '雌雄双股剑') {
      room.logs.push(`${attacker.name} 发动雌雄双股剑效果`);
      if (target.handCards.length > 0) {
        const randomCard = target.handCards[Math.floor(Math.random() * target.handCards.length)];
        const idx = target.handCards.findIndex(c => c.id === randomCard.id);
        if (idx !== -1) {
          target.handCards.splice(idx, 1);
          room.discardPile.push(randomCard);
          room.logs.push(`${target.name} 弃掉一张手牌`);
        }
      }
    }
  }

  resolveWeaponDefendedEffect(room, attacker, target, card) {
    const weapon = attacker.equipment.weapon;
    if (!weapon) return;

    if (weapon.name === '青龙偃月刀') {
      room.logs.push(`${attacker.name} 发动青龙偃月刀效果，可再次使用【杀】`);
      attacker.hasUsedAttackThisTurn = false;
    } else if (weapon.name === '贯石斧') {
      if (attacker.handCards.length >= 2) {
        room.logs.push(`${attacker.name} 发动贯石斧效果，弃两张牌使【杀】仍然造成伤害`);
        for (let i = 0; i < 2; i++) {
          if (attacker.handCards.length > 0) {
            room.discardPile.push(attacker.handCards.pop());
          }
        }
        this.dealDamage(room, target, 1, attacker);
      }
    }
  }

  resolveDuel(room, initiator, target) {
    let initiatorNeedsTwo = initiator.warrior?.skill?.includes('无双');
    let targetNeedsTwo = target.warrior?.skill?.includes('无双');

    let initiatorAttackCount = initiatorNeedsTwo ? 2 : 1;
    let targetAttackCount = targetNeedsTwo ? 2 : 1;

    const initiatorAttacks = initiator.handCards.filter(c => c.type === CARD_TYPES.ATTACK).length;
    const targetAttacks = target.handCards.filter(c => c.type === CARD_TYPES.ATTACK).length;

    if (initiatorAttacks >= initiatorAttackCount) {
      room.logs.push(`${initiator.name} 使用${initiatorAttackCount}张【杀】`);
      if (targetAttacks >= targetAttackCount) {
        room.logs.push(`${target.name} 使用${targetAttackCount}张【杀】`);
        room.logs.push('决斗平局');
      } else {
        room.logs.push(`${target.name} 无法打出足够的【杀】`);
        this.dealDamage(room, target, 1, initiator);
      }
    } else {
      room.logs.push(`${initiator.name} 无法打出足够的【杀】`);
      this.dealDamage(room, initiator, 1, target);
    }
  }

  dealDamage(room, target, amount, source = null) {
    for (let i = 0; i < amount; i++) {
      if (target.health <= 0) break;
      
      const hasShield = target.equipment.armor?.name === '八卦阵';
      if (hasShield && Math.random() > 0.5) {
        room.logs.push(`${target.name} 发动八卦阵，判定成功，抵消了1点伤害`);
        continue;
      }
      
      target.health--;
      room.logs.push(`${target.name} 受到1点伤害，当前体力：${target.health}`);

      if (source && source.warrior?.skill === '奸雄') {
        room.logs.push(`${source.name} 发动奸雄，获得造成伤害的牌`);
      }

      if (target.warrior?.skill === '反馈') {
        if (source) {
          room.logs.push(`${target.name} 发动反馈，获得${source.name}的一张牌`);
          if (source.handCards.length > 0) {
            const randomCard = source.handCards[Math.floor(Math.random() * source.handCards.length)];
            const idx = source.handCards.findIndex(c => c.id === randomCard.id);
            if (idx !== -1) {
              source.handCards.splice(idx, 1);
              target.handCards.push(randomCard);
            }
          }
        }
      }

      if (target.warrior?.skill === '刚烈') {
        const roll = Math.floor(Math.random() * 13) + 1;
        const isRed = roll >= 1 && roll <= 6;
        if (!isRed && source) {
          room.logs.push(`${target.name} 发动刚烈，${source.name}需要弃两张牌或受到1点伤害`);
          if (source.handCards.length < 2) {
            this.dealDamage(room, source, 1, target);
          } else {
            for (let j = 0; j < 2; j++) {
              if (source.handCards.length > 0) {
                room.discardPile.push(source.handCards.pop());
              }
            }
            room.logs.push(`${source.name} 弃掉了两张牌`);
          }
        }
      }

      if (target.warrior?.skill === '遗计') {
        room.logs.push(`${target.name} 发动遗计，摸两张牌`);
        for (let j = 0; j < 2; j++) {
          if (room.deck.length > 0) {
            target.handCards.push(room.deck.pop());
          }
        }
      }

      if (target.isChained) {
        this.resolveChainDamage(room, target, source);
      }

      if (target.health <= 0) {
        this.handleDeath(room, target, source);
      }
    }
  }

  resolveChainDamage(room, target, source) {
    room.logs.push(`${target.name} 的铁索连环传导伤害！`);
    room.players.forEach(p => {
      if (p.id !== target.id && p.isChained && p.health > 0) {
        room.logs.push(`${p.name} 受到传导的1点伤害`);
        p.health--;
        if (p.health <= 0) {
          this.handleDeath(room, p, source);
        }
      }
    });
    target.isChained = false;
    room.players.forEach(p => { p.isChained = false; });
  }

  handleDeath(room, target, source = null) {
    target.health = 0;
    room.logs.push(`${target.name} 阵亡了！`);
    
    if (target.warrior?.skill === '武魂') {
      room.logs.push(`${target.name} 发动武魂，对伤害来源造成1点伤害`);
      if (source) {
        this.dealDamage(room, source, 1);
      }
    }

    if (source && source.warrior?.skill === '枭姬') {
      const dropCount = Math.min(target.handCards.length, 2);
      room.logs.push(`${source.name} 发动枭姬，获得${dropCount}张牌`);
      for (let j = 0; j < dropCount; j++) {
        if (target.handCards.length > 0) {
          source.handCards.push(target.handCards.pop());
        }
      }
    }

    if (source && source.warrior?.skill === '恩怨') {
      if (target.health < target.maxHealth) {
        room.logs.push(`${source.name} 发动恩怨，${target.name}需交给${source.name}一张红桃牌`);
      } else {
        room.logs.push(`${source.name} 发动恩怨，对${target.name}造成1点伤害`);
        this.dealDamage(room, target, 1, source);
      }
    }

    this.checkGameOver(room);
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

    const currentPlayer = room.players[room.currentPlayerIndex];
    
    currentPlayer.hasUsedAttackThisTurn = false;
    currentPlayer.attackCount = 0;
    currentPlayer.hasUsedSkillThisTurn = false;
    currentPlayer.givenCardsCount = 0;

    const hasUsedAttack = currentPlayer.attackCount > 0;
    const hasKeji = currentPlayer.warrior?.skill === '克己';
    
    if (!hasKeji || hasUsedAttack) {
      const handLimit = currentPlayer.warrior?.skill === '英姿' ? 4 : currentPlayer.maxHealth;
      if (currentPlayer.handCards.length > handLimit) {
        const excess = currentPlayer.handCards.length - handLimit;
        room.logs.push(`${currentPlayer.name} 弃掉${excess}张牌`);
        for (let i = 0; i < excess; i++) {
          if (currentPlayer.handCards.length > handLimit) {
            const card = currentPlayer.handCards.pop();
            room.discardPile.push(card);
          }
        }
      }
    } else {
      room.logs.push(`${currentPlayer.name} 发动克己，跳过弃牌阶段`);
    }

    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

    if (room.currentPlayerIndex === 0) {
      room.turnNumber++;
      room.logs.push(`第 ${room.turnNumber} 回合开始`);
    }

    while (true) {
      const nextPlayer = room.players[room.currentPlayerIndex];
      
      this.resolveDelayedEffects(room, nextPlayer);

      if (!nextPlayer.isLocked) {
        room.logs.push(`${nextPlayer.name} 的回合`);
        
        if (nextPlayer.warrior?.skill === '突袭') {
          room.logs.push(`${nextPlayer.name} 发动突袭，放弃摸牌`);
          const otherPlayers = room.players.filter(p => p.id !== nextPlayer.id && p.health > 0 && p.handCards.length > 0);
          for (let i = 0; i < 2 && otherPlayers.length > 0; i++) {
            const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            const randomCard = target.handCards[Math.floor(Math.random() * target.handCards.length)];
            const idx = target.handCards.findIndex(c => c.id === randomCard.id);
            if (idx !== -1) {
              target.handCards.splice(idx, 1);
              nextPlayer.handCards.push(randomCard);
              room.logs.push(`${nextPlayer.name} 获得了 ${target.name} 的一张牌`);
            }
          }
        } else if (nextPlayer.warrior?.skill === '英姿') {
          room.logs.push(`${nextPlayer.name} 发动英姿，多摸一张牌`);
          for (let i = 0; i < 3; i++) {
            if (room.deck.length > 0) {
              nextPlayer.handCards.push(room.deck.pop());
            }
          }
        } else {
          for (let i = 0; i < 2; i++) {
            if (room.deck.length > 0) {
              nextPlayer.handCards.push(room.deck.pop());
            }
          }
        }
        
        if (nextPlayer.warrior?.skill?.includes('观星')) {
          room.logs.push(`${nextPlayer.name} 发动观星`);
        }
        break;
      } else {
        room.logs.push(`${nextPlayer.name} 被乐不思蜀锁定，跳过出牌阶段`);
        nextPlayer.isLocked = false;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        if (room.currentPlayerIndex === 0) {
          room.turnNumber++;
          room.logs.push(`第 ${room.turnNumber} 回合开始`);
        }
      }
    }

    return room;
  }

  resolveDelayedEffects(room, player) {
    player.isLocked = false;
    
    player.delayedEffects = player.delayedEffects.filter(effect => {
      if (effect.type === 'locked') {
        const roll = Math.floor(Math.random() * 13) + 1;
        room.logs.push(`${player.name} 的乐不思蜀判定：${roll}`);
        if (roll !== 12) {
          player.isLocked = true;
          return true;
        }
        room.logs.push(`判定成功，乐不思蜀解除`);
        return false;
      }
      
      if (effect.type === 'lightning') {
        const roll = Math.floor(Math.random() * 13) + 1;
        room.logs.push(`${player.name} 的闪电判定：${roll}`);
        if (roll >= 10 && roll <= 13) {
          room.logs.push(`判定成功！${player.name} 受到3点雷电伤害`);
          this.dealDamage(room, player, 3);
          return false;
        }
        room.logs.push(`判定失败，闪电传递给下一位玩家`);
        const nextIndex = (room.players.findIndex(p => p.id === player.id) + 1) % room.players.length;
        const nextPlayer = room.players[nextIndex];
        nextPlayer.delayedEffects.push(effect);
        return false;
      }
      
      return true;
    });
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
        warrior: p.warrior ? {
          id: p.warrior.id,
          name: p.warrior.name,
          title: p.warrior.title,
          skill: p.warrior.skill,
          skillDesc: p.warrior.skillDesc,
          icon: p.warrior.icon,
          hp: p.warrior.hp,
        } : null,
        hasSelectedWarrior: p.hasSelectedWarrior,
        isChained: p.isChained || false,
        delayedEffects: p.delayedEffects.map(e => ({
          type: e.type,
          name: e.name,
        })),
      })),
      currentPlayerIndex: room.currentPlayerIndex,
      gamePhase: room.gamePhase,
      turnNumber: room.turnNumber,
      logs: room.logs,
      discardPileCount: room.discardPile.length,
      deckCount: room.deck.length,
      availableWarriors: room.gamePhase === 'selecting_warrior' ? room.availableWarriors.map(w => ({
        id: w.id,
        name: w.name,
        title: w.title,
        skill: w.skill,
        skillDesc: w.skillDesc,
        icon: w.icon,
        hp: w.hp,
      })) : [],
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
