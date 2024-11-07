// tests/messageUtils.test.js

const mongoose = require('mongoose');
const Message = require('../../models/messageModel');
const Channel = require('../../models/channelModel');
const Game = require('../../models/gameModel');
const CustomError = require('../../classes/CustomError');
const { errors } = require('../../messages');
const { games } = require('../../classes/GameState');
const _ = require('lodash');

const messageUtils = require('../../utils/messageUtils');

const {
  buildMessageQuery,
  getSendMessageType,
  canUserAccessChannel,
  usersCanReceive,
  getReceiveMessageType,
  receiveMessageTypeForPl,
  sendMessageTypeForPl,
  isUserInChannel,
  getSpectators,
} = messageUtils;

jest.mock('../../models/messageModel');
jest.mock('../../models/channelModel');
jest.mock('../../models/gameModel');

jest.mock('../../classes/GameState', () => {
  return {
    games: {},
  };
});

describe('buildMessageQuery', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete games['channel123'];
  });

  it('メッセージIDが存在し、メッセージが存在する場合、適切なクエリを返す', async () => {
    const channelId = 'channel123';
    const messageId = 'message123';
    const userId = 'user123';
    const mockMessage = {
      _id: messageId,
      createdAt: new Date('2023-01-01T00:00:00Z'),
    };

    Message.findById.mockResolvedValue(mockMessage);

    // games オブジェクトを設定
    games[channelId] = {
      players: {
        players: new Map([[userId, { role: 'villager', status: 'alive' }]]),
      },
    };

    const query = await buildMessageQuery(channelId, messageId, userId);

    expect(Message.findById).toHaveBeenCalledWith(messageId);
    expect(query).toEqual({
      channel: channelId,
      createdAt: { $lte: mockMessage.createdAt },
      messageType: { $in: ['normal'] },
    });
  });

  it('メッセージIDが存在しない場合、createdAt条件が含まれないクエリを返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    // games オブジェクトを設定
    games[channelId] = {
      players: {
        players: new Map([[userId, { role: 'villager', status: 'alive' }]]),
      },
    };

    const query = await buildMessageQuery(channelId, null, userId);

    expect(Message.findById).not.toHaveBeenCalled();
    expect(query).toEqual({
      channel: channelId,
      messageType: { $in: ['normal'] },
    });
  });

  it('メッセージが存在しない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const messageId = 'message123';
    const userId = 'user123';

    Message.findById.mockResolvedValue(null);

    await expect(buildMessageQuery(channelId, messageId, userId)).rejects.toThrowError(
      new CustomError(404, errors.MESSAGE_NOT_FOUND)
    );
  });

  it('getReceiveMessageTypeがnullを返す場合、messageTypeが含まれないクエリを返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    // games オブジェクトを設定しない（存在しない状態）

    const query = await buildMessageQuery(channelId, null, userId);

    expect(query).toEqual({
      channel: channelId,
    });
  });
});

describe('getReceiveMessageType', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete games['channel123'];
  });

  it('ゲームが存在し、プレイヤーが存在する場合、適切なメッセージタイプを返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    games[channelId] = {
      players: {
        players: new Map([[userId, { role: 'werewolf', status: 'alive' }]]),
      },
    };

    const result = await getReceiveMessageType(channelId, userId);

    expect(result).toEqual({ $in: ['normal', 'werewolf'] });
  });

  it('ゲームが存在しない場合、nullを返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    const result = await getReceiveMessageType(channelId, userId);

    expect(result).toBeNull();
  });
});

describe('receiveMessageTypeForPl', () => {
  it('プレイヤーが存在しない場合、nullを返す', () => {
    const result = receiveMessageTypeForPl(null);

    expect(result).toBeNull();
  });

  it('プレイヤーが死亡している場合、nullを返す', () => {
    const mockPlayer = { status: 'dead' };

    const result = receiveMessageTypeForPl(mockPlayer);

    expect(result).toBeNull();
  });

  it('プレイヤーが人狼の場合、["normal", "werewolf"]を返す', () => {
    const mockPlayer = { role: 'werewolf', status: 'alive' };

    const result = receiveMessageTypeForPl(mockPlayer);

    expect(result).toEqual({ $in: ['normal', 'werewolf'] });
  });

  it('プレイヤーが村人の場合、["normal"]を返す', () => {
    const mockPlayer = { role: 'villager', status: 'alive' };

    const result = receiveMessageTypeForPl(mockPlayer);

    expect(result).toEqual({ $in: ['normal'] });
  });
});

describe('getSendMessageType', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete games['channel123'];
  });

  it('チャンネルが存在する場合、"normal"を返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Channel.exists.mockResolvedValue(true);

    const result = await getSendMessageType(channelId, userId);

    expect(Channel.exists).toHaveBeenCalledWith({ _id: channelId });
    expect(result).toBe('normal');
  });

  it('ゲームが存在し、プレイヤーが人狼で夜の場合、"werewolf"を返す', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Channel.exists.mockResolvedValue(false);

    games[channelId] = {
      phase: { currentPhase: 'night' },
      players: {
        players: new Map([[userId, { role: 'werewolf', status: 'alive' }]]),
      },
    };

    const result = await getSendMessageType(channelId, userId);

    expect(result).toBe('werewolf');
  });

  it('チャンネルもゲームも存在しない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Channel.exists.mockResolvedValue(false);
    delete games[channelId];

    await expect(getSendMessageType(channelId, userId)).rejects.toThrowError(
      new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN)
    );
  });
});

describe('sendMessageTypeForPl', () => {
  it('プレイヤーが存在しない場合、"spectator"を返す', () => {
    const result = sendMessageTypeForPl(null, 'day');

    expect(result).toBe('spectator');
  });

  it('プレイヤーが死亡している場合、"spectator"を返す', () => {
    const mockPlayer = { status: 'dead' };

    const result = sendMessageTypeForPl(mockPlayer, 'day');

    expect(result).toBe('spectator');
  });

  it('プレイヤーが生存し、夜以外のフェーズの場合、"normal"を返す', () => {
    const mockPlayer = { status: 'alive' };

    const result = sendMessageTypeForPl(mockPlayer, 'day');

    expect(result).toBe('normal');
  });

  it('プレイヤーが人狼で夜のフェーズの場合、"werewolf"を返す', () => {
    const mockPlayer = { status: 'alive', role: 'werewolf' };

    const result = sendMessageTypeForPl(mockPlayer, 'night');

    expect(result).toBe('werewolf');
  });

  it('プレイヤーが村人で夜のフェーズの場合、CustomErrorがスローされる', () => {
    const mockPlayer = { status: 'alive', role: 'villager' };

    expect(() => {
      sendMessageTypeForPl(mockPlayer, 'night');
    }).toThrowError(new CustomError(403, errors.MESSAGE_SENDING_FORBIDDEN));
  });
});

describe('canUserAccessChannel', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete games['channel123'];
  });

  it('ユーザーがチャンネルに所属している場合、何も起こらない', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    const mockGame = { channel: 'channel123' };

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockGame),
    });

    Channel.exists.mockResolvedValue(true);

    await expect(canUserAccessChannel(channelId, userId)).resolves.toBeUndefined();
  });

  it('ユーザーがチャンネルに所属していない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    const mockGame = { channel: 'channel123' };

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockGame),
    });

    Channel.exists.mockResolvedValue(false);

    await expect(canUserAccessChannel(channelId, userId)).rejects.toThrowError(
      new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN)
    );
  });

  it('ゲームもチャンネルも存在しない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    Channel.exists.mockResolvedValue(false);

    await expect(canUserAccessChannel(channelId, userId)).rejects.toThrowError(
      new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN)
    );
  });
});

describe('isUserInChannel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザーがチャンネルに所属している場合、何も起こらない', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Channel.exists.mockResolvedValue(true);

    await expect(isUserInChannel(channelId, userId)).resolves.toBeUndefined();
  });

  it('ユーザーがチャンネルに所属していない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const userId = 'user123';

    Channel.exists.mockResolvedValue(false);

    await expect(isUserInChannel(channelId, userId)).rejects.toThrowError(
      new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN)
    );
  });
});

describe('usersCanReceive', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete games['channel123'];
  });

  it('メッセージタイプが "spectator" の場合、観戦者のリストを返す', async () => {
    const channelId = 'channel123';
    const messageType = 'spectator';

    const mockSpectators = ['user456', 'user789'];

    games[channelId] = {
      players: {
        getLivingPlayers: jest.fn().mockReturnValue([{ _id: 'user123' }]),
      },
    };

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        users: ['user123', 'user456', 'user789'],
      }),
    });

    const result = await usersCanReceive(channelId, messageType);

    expect(result).toEqual(mockSpectators);
  });

  it('メッセージタイプが "werewolf" の場合、観戦者と人狼のリストを返す', async () => {
    const channelId = 'channel123';
    const messageType = 'werewolf';

    const mockSpectators = ['user456'];
    const mockWerewolves = ['user123'];

    games[channelId] = {
      players: {
        getLivingPlayers: jest.fn().mockReturnValue([{ _id: 'user123' }]),
        getWerewolves: jest.fn().mockReturnValue(mockWerewolves),
      },
    };

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        users: ['user123', 'user456'],
      }),
    });

    const result = await usersCanReceive(channelId, messageType);

    expect(result).toEqual(['user456', 'user123']);
  });

  it('ゲームが存在しない場合、nullを返す', async () => {
    const channelId = 'channel123';
    const messageType = 'spectator';

    delete games[channelId];

    const result = await usersCanReceive(channelId, messageType);

    expect(result).toBeNull();
  });

  it('メッセージタイプがその他の場合、nullを返す', async () => {
    const channelId = 'channel123';
    const messageType = 'normal';

    games[channelId] = {};

    const result = await usersCanReceive(channelId, messageType);

    expect(result).toBeNull();
  });
});

describe('getSpectators', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('観戦者がいる場合、観戦者のリストを返す', async () => {
    const channelId = 'channel123';
    const gameState = {
      players: {
        getLivingPlayers: jest.fn().mockReturnValue([{ _id: 'user123' }]),
      },
    };

    const mockGame = { users: ['user123', 'user456', 'user789'] };

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockGame),
    });

    const result = await getSpectators(channelId, gameState);

    expect(result).toEqual(['user456', 'user789']);
  });

  it('ゲームが存在しない場合、CustomErrorがスローされる', async () => {
    const channelId = 'channel123';
    const gameState = {};

    Game.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(getSpectators(channelId, gameState)).rejects.toThrowError(
      new CustomError(404, errors.GAME_NOT_FOUND)
    );
  });
});
