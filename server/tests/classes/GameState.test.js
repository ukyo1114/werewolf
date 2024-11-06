// tests/GameState.test.js

const { GameState, games } = require('../../classes/GameState');
const { EventEmitter } = require('events');
const PlayerManager = require('../../classes/PlayerManager');
const VoteManager = require('../../classes/VoteManager');
const FortuneManager = require('../../classes/FortuneManager');
const AttackManager = require('../../classes/AttackManager');
const GuardManager = require('../../classes/GuardManager');
const MediumManager = require('../../classes/MediumManager');
const PhaseManager = require('../../classes/PhaseManager');
const Game = require('../../models/gameModel');
const Message = require('../../models/messageModel');
const { gameMaster } = require('../../messages');
const { channelEvents } = require('../../socketHandlers/chatNameSpace');
const { gameEvents } = require('../../classes/GameState');
const sinon = require('sinon');

jest.mock('../../models/gameModel');
jest.mock('../../models/messageModel');
jest.mock('../../classes/PlayerManager');
jest.mock('../../classes/VoteManager');
jest.mock('../../classes/FortuneManager');
jest.mock('../../classes/AttackManager');
jest.mock('../../classes/GuardManager');
jest.mock('../../classes/MediumManager');
jest.mock('../../classes/PhaseManager');
jest.mock('../../socketHandlers/chatNameSpace');

describe('GameStateクラスのテスト', () => {
  let game;
  let gameState;

  beforeEach(() => {
    jest.clearAllMocks();
    game = {
      _id: 'gameId123',
      channel: 'channelId123',
      users: [
        { _id: 'user1', name: 'Alice' },
        { _id: 'user2', name: 'Bob' },
        { _id: 'user3', name: 'Charlie' },
      ],
    };

    // 各マネージャークラスのインスタンスをモック
    PlayerManager.mockImplementation(() => {
      const players = new Map([
        ['user1', { _id: 'user1', status: 'alive' }],
        ['user2', { _id: 'user2', status: 'dead' }],
      ]);
    
      return {
        players,
        getLivingPlayers: jest.fn().mockReturnValue([...players.values()].filter(pl => pl.status === 'alive')),
        getPlayersWithoutRole: jest.fn(),
        kill: jest.fn(),
        getPlayerById: jest.fn().mockImplementation((playerId) => {
          return players.get(playerId);
        }),
      };
    });

    PhaseManager.mockImplementation(() => ({
      currentPhase: 'day',
      currentDay: 1,
      changedAt: new Date(),
      eventEmitter: new EventEmitter(),
    }));

    VoteManager.mockImplementation(() => ({
      getExecutionTarget: jest.fn(),
    }));

    FortuneManager.mockImplementation(() => ({
      fortune: jest.fn(),
    }));

    AttackManager.mockImplementation(() => ({
      attack: jest.fn(),
    }));

    GuardManager.mockImplementation(() => ({}));

    MediumManager.mockImplementation(() => ({
      medium: jest.fn(),
    }));

    // GameStateのインスタンスを作成
    gameState = new GameState(game);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. createGameメソッドのテスト
  describe('createGameメソッド', () => {
    it('ゲームが正しく作成され、gamesオブジェクトに追加されること', () => {
      GameState.createGame(game);

      expect(games[game._id]).toBeInstanceOf(GameState);
    });
  });

  // 2. handleTimerEndメソッドのテスト
  describe('handleTimerEndメソッド', () => {
    beforeEach(() => {
      gameState.handleDayPhaseEnd = jest.fn();
      gameState.handleNightPhaseEnd = jest.fn();
      gameState.handleGameEnd = jest.fn();
      gameState.sendMessage = jest.fn();
      gameState.eventEmitter.emit = jest.fn();
    });

    it('dayフェーズの場合、handleDayPhaseEndが呼び出されること', async () => {
      gameState.phase.currentPhase = 'day';
      await gameState.handleTimerEnd();

      expect(gameState.isProcessing).toBe(true);
      expect(gameState.handleDayPhaseEnd).toHaveBeenCalled();
      expect(gameState.eventEmitter.emit).toHaveBeenCalledWith('processCompleted');
    });

    it('nightフェーズの場合、handleNightPhaseEndが呼び出されること', async () => {
      gameState.phase.currentPhase = 'night';
      await gameState.handleTimerEnd();

      expect(gameState.isProcessing).toBe(true);
      expect(gameState.handleNightPhaseEnd).toHaveBeenCalled();
      expect(gameState.eventEmitter.emit).toHaveBeenCalledWith('processCompleted');
    });

    it('finishedフェーズの場合、handleGameEndが呼び出されること', async () => {
      gameState.phase.currentPhase = 'finished';
      await gameState.handleTimerEnd();

      expect(gameState.handleGameEnd).toHaveBeenCalled();
    });
  });

  // 3. handlePhaseSwitchedメソッドのテスト
  describe('handlePhaseSwitchedメソッド', () => {
    it('updateGameStateが呼び出され、isProcessingがfalseになること', () => {
      gameState.updateGameState = jest.fn();

      gameState.handlePhaseSwitched();

      expect(gameState.updateGameState).toHaveBeenCalled();
      expect(gameState.isProcessing).toBe(false);
    });
  });

  // 4. handleDayPhaseEndメソッドのテスト
  describe('handleDayPhaseEndメソッド', () => {
    beforeEach(() => {
      gameState.execution = jest.fn();
      gameState.judgement = jest.fn();
      gameState.sendMessage = jest.fn();
      gameState.result.value = 'running';
    });

    it('executionが呼び出されること', async () => {
      await gameState.handleDayPhaseEnd();

      expect(gameState.execution).toHaveBeenCalled();
    });

    it('resultがrunningの場合、NIGHTメッセージが送信されること', async () => {
      await gameState.handleDayPhaseEnd();

      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.NIGHT);
    });

    it('resultがvillageAbandonedの場合、NIGHTメッセージが送信されないこと', async () => {
      gameState.result.value = 'villageAbandoned';

      await gameState.handleDayPhaseEnd();

      expect(gameState.sendMessage).not.toHaveBeenCalledWith(gameMaster.NIGHT);
    });
  });

  // 5. handleNightPhaseEndメソッドのテスト
  describe('handleNightPhaseEndメソッド', () => {
    beforeEach(() => {
      gameState.fortune.fortune = jest.fn();
      gameState.attack.attack = jest.fn().mockReturnValue({ name: 'Bob' });
      gameState.sendMessage = jest.fn();
      gameState.judgement = jest.fn();
      gameState.result.value = 'running';
    });

    it('fortune.fortuneが呼び出されること', async () => {
      await gameState.handleNightPhaseEnd();

      expect(gameState.fortune.fortune).toHaveBeenCalled();
    });

    it('attack.attackの結果に応じてメッセージが送信されること', async () => {
      await gameState.handleNightPhaseEnd();

      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.ATTACK('Bob'));
    });

    it('resultがrunningの場合、MORNINGメッセージが送信されること', async () => {
      await gameState.handleNightPhaseEnd();

      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.MORNING);
    });
  });

  // 6. handleGameEndメソッドのテスト
  describe('handleGameEndメソッド', () => {
    beforeEach(() => {
      gameState.eventEmitter.removeListener = jest.fn();
      delete games[gameState.gameId]; // ゲームを削除しておく
      Game.findByIdAndUpdate.mockResolvedValue();
    });

    it('ゲームが正しく終了し、gamesオブジェクトから削除されること', async () => {
      games[gameState.gameId] = gameState; // ゲームを追加

      await gameState.handleGameEnd();

      expect(Game.findByIdAndUpdate).toHaveBeenCalledWith(gameState.gameId, { result: gameState.result.value });
      expect(gameState.eventEmitter.removeListener).toHaveBeenCalledTimes(2);
      expect(games[gameState.gameId]).toBeUndefined();
    });

    it('エラーが発生した場合、エラーメッセージが出力されること', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test Error');
      Game.findByIdAndUpdate.mockRejectedValue(error);

      await gameState.handleGameEnd();

      expect(consoleErrorSpy).toHaveBeenCalledWith(`Failed to end game ${gameState.gameId}:`, error.message);

      consoleErrorSpy.mockRestore();
    });
  });

  // 7. judgementメソッドのテスト
  describe('judgementメソッド', () => {
    beforeEach(() => {
      gameState.players.getLivingPlayers = jest.fn().mockReturnValue([
        { role: 'villager' },
        { role: 'villager' },
        { role: 'werewolf' },
      ]);
      gameState.sendMessage = jest.fn();
    });

    it('werewolvesが0の場合、villagersWinになること', async () => {
      gameState.players.getLivingPlayers.mockReturnValue([
        { role: 'villager' },
        { role: 'villager' },
      ]);

      await gameState.judgement();

      expect(gameState.result.value).toBe('villagersWin');
      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.VILLAGERS_WIN);
    });

    it('werewolvesがvillagers以上の場合、werewolvesWinになること', async () => {
      gameState.players.getLivingPlayers.mockReturnValue([
        { role: 'werewolf' },
        { role: 'werewolf' },
        { role: 'villager' },
      ]);

      await gameState.judgement();

      expect(gameState.result.value).toBe('werewolvesWin');
      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.WEREWOLVES_WIN);
    });

    it('ゲームが継続中の場合、resultは変更されないこと', async () => {
      await gameState.judgement();

      expect(gameState.result.value).toBe('running');
      expect(gameState.sendMessage).not.toHaveBeenCalled();
    });
  });

  // 8. executionメソッドのテスト
  describe('executionメソッド', () => {
    beforeEach(() => {
      gameState.votes.getExecutionTarget = jest.fn().mockReturnValue({ _id: 'user2', name: 'Bob' });
      gameState.players.kill = jest.fn();
      gameState.sendMessage = jest.fn();
      gameState.medium.medium = jest.fn();
    });

    it('処刑対象が正しく処刑されること', async () => {
      await gameState.execution();

      expect(gameState.players.kill).toHaveBeenCalledWith('user2');
      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.EXECUTION('Bob'));
      expect(gameState.medium.medium).toHaveBeenCalledWith('user2');
    });

    it('処刑対象がいない場合、villageAbandonedが呼び出されること', async () => {
      gameState.votes.getExecutionTarget.mockReturnValue(null);
      gameState.villageAbandoned = jest.fn();

      await gameState.execution();

      expect(gameState.villageAbandoned).toHaveBeenCalled();
    });
  });

  // 9. villageAbandonedメソッドのテスト
  describe('villageAbandonedメソッド', () => {
    beforeEach(() => {
      gameState.sendMessage = jest.fn();
    });

    it('resultがvillageAbandonedに設定され、メッセージが送信されること', async () => {
      await gameState.villageAbandoned();

      expect(gameState.result.value).toBe('villageAbandoned');
      expect(gameState.sendMessage).toHaveBeenCalledWith(gameMaster.VILLAGE_ABANDONED);
    });
  });

  // 10. updateGameStateメソッドのテスト
  describe('updateGameStateメソッド', () => {
    beforeEach(() => {
      gameState.getGameState = jest.fn().mockReturnValue({ gameId: 'gameId123' });
      gameEvents.emit = jest.fn();
    });

    it('updateGameStateイベントが正しく発火されること', () => {
      gameState.updateGameState();

      expect(gameEvents.emit).toHaveBeenCalledWith('updateGameState', { gameId: 'gameId123' });
    });
  });

  // 11. getGameStateメソッドのテスト
  describe('getGameStateメソッド', () => {
    it('ゲームの状態が正しく取得されること', () => {
      gameState.players.getPlayersWithoutRole.mockReturnValue([{ _id: 'user1', name: 'Alice' }]);
      gameState.phase.currentDay = 2;
      gameState.phase.currentPhase = 'night';
      gameState.phase.changedAt = new Date('2023-01-01T00:00:00Z');

      const gameStateData = gameState.getGameState();

      expect(gameStateData).toEqual({
        gameId: gameState.gameId,
        users: [{ _id: 'user1', name: 'Alice' }],
        phase: {
          currentDay: 2,
          currentPhase: 'night',
          changedAt: new Date('2023-01-01T00:00:00Z'),
        },
      });
    });
  });

  // 12. sendMessageメソッドのテスト
  describe('sendMessageメソッド', () => {
    beforeEach(() => {
      gameState.createMessage = jest.fn().mockResolvedValue({ _id: 'messageId123' });
      channelEvents.emit = jest.fn();
    });

    it('メッセージが正しく作成され、newMessageイベントが発火されること', async () => {
      await gameState.sendMessage('Test Message');

      expect(gameState.createMessage).toHaveBeenCalledWith('Test Message');
      expect(channelEvents.emit).toHaveBeenCalledWith('newMessage', { _id: 'messageId123' });
    });
  });

  // 13. isUserInGameメソッドのテスト
  describe('isUserInGameメソッド', () => {
    beforeEach(() => {
      games['game1'] = {
        players: {
          players: new Map([['user1', {}]]),
        },
        result: { value: 'running' },
      };
    });

    afterEach(() => {
      delete games['game1'];
    });

    it('ユーザーがゲームに参加している場合、trueを返すこと', () => {
      const result = GameState.isUserInGame('user1');

      expect(result).toBe(true);
    });

    it('ユーザーがゲームに参加していない場合、falseを返すこと', () => {
      const result = GameState.isUserInGame('user2');

      expect(result).toBe(false);
    });

    it('ゲームが終了している場合、falseを返すこと', () => {
      games['game1'].result.value = 'finished';

      const result = GameState.isUserInGame('user1');

      expect(result).toBe(false);
    });
  });

  // 14. isPlayingGameメソッドのテスト
  describe('isPlayingGameメソッド', () => {
    beforeEach(() => {
      games['game1'] = {
        players: {
          players: new Map([]),
        },
        phase: {
          currentPhase: 'day',
        },
        gameId: 'game1',
      };
      
      games['game1'].players.players = new Map([
        ['user1', { _id: 'user1', status: 'alive' }],
        ['user2', { _id: 'user2', status: 'dead' }],
      ]);

      games['game1'].players.getPlayerById = jest.fn().mockImplementation((userId) => {
        return games['game1'].players.players.get(userId);
      });
    });

    afterEach(() => {
      delete games['game1'];
    });

    it('ユーザーがゲーム中の場合、gameIdを返すこと', () => {
      const result = GameState.isPlayingGame('user1');

      expect(result).toBe('game1');
    });

    it('ユーザーが死亡している場合、nullを返すこと', () => {
      games['game1'].players.players.set('user1', { _id: 'user1', status: 'dead' });

      const result = GameState.isPlayingGame('user1');

      expect(result).toBeNull();
    });

    it('ゲームが終了している場合、nullを返すこと', () => {
      games['game1'].phase.currentPhase = 'finished';

      const result = GameState.isPlayingGame('user1');

      expect(result).toBeNull();
    });

    it('ユーザーがゲームに参加していない場合、nullを返すこと', () => {
      const result = GameState.isPlayingGame('user2');

      expect(result).toBeNull();
    });
  });
});
