// tests/Entry.test.js

const { Entry, entryEvents } = require('../../classes/Entry');
const Game = require('../../models/gameModel');
const { GameState } = require('../../classes/GameState');

// モックの設定
jest.mock('../../models/gameModel');
jest.mock('../../classes/GameState');

describe('Entryクラスのテスト', () => {
  let entry;
  let channelId;

  beforeEach(() => {
    channelId = 'testChannel';
    entry = new Entry(channelId);

    // イベントリスナーをクリア
    entryEvents.removeAllListeners();

    // モックをクリア
    jest.clearAllMocks();
  });

  // 1. registerメソッドのテスト
  describe('registerメソッド', () => {
    it('ユーザーが正常に登録されること', async () => {
      const socketId = 'socket1';
      const userId = 'user1';

      // entryUpdateイベントをモック
      const entryUpdateMock = jest.fn();
      entryEvents.on('entryUpdate', entryUpdateMock);

      await entry.register(socketId, userId);

      expect(entry.users).toContainEqual({ socketId, userId });
      expect(entryUpdateMock).toHaveBeenCalledWith({
        channelId,
        userList: [userId],
      });
    });

    it('ユーザーが登録された後にentryUpdateが呼び出されること', async () => {
      const socketId = 'socket1';
      const userId = 'user1';

      // entryUpdateイベントをモック
      const entryUpdateMock = jest.fn();
      entryEvents.on('entryUpdate', entryUpdateMock);

      await entry.register(socketId, userId);

      expect(entryUpdateMock).toHaveBeenCalledTimes(1);
    });

    it('MAX_USERSに達したときにstartGameが呼び出されること', async () => {
      // startGameメソッドをモック
      entry.startGame = jest.fn();

      // ユーザーをMAX_USERS - 1人登録
      for (let i = 1; i < Entry.MAX_USERS; i++) {
        await entry.register(`socket${i}`, `user${i}`);
      }

      expect(entry.startGame).not.toHaveBeenCalled();

      // MAX_USERS番目のユーザーを登録
      await entry.register(`socket${Entry.MAX_USERS}`, `user${Entry.MAX_USERS}`);

      expect(entry.startGame).toHaveBeenCalledTimes(1);
      expect(entry.isGameStarting).toBe(true);
    });

    it('isGameStartingがtrueの場合、ユーザーが登録されないこと', async () => {
      entry.isGameStarting = true;
      const socketId = 'socket1';
      const userId = 'user1';

      await entry.register(socketId, userId);

      expect(entry.users).toHaveLength(0);
    });
  });

  // 2. cancelメソッドのテスト
  describe('cancelメソッド', () => {
    it('ユーザーが正常にキャンセルされること', () => {
      const socketId = 'socket1';
      const userId = 'user1';

      entry.users = [{ socketId, userId }];

      // entryUpdateイベントをモック
      const entryUpdateMock = jest.fn();
      entryEvents.on('entryUpdate', entryUpdateMock);

      entry.cancel(socketId);

      expect(entry.users).not.toContainEqual({ socketId, userId });
      expect(entryUpdateMock).toHaveBeenCalledWith({
        channelId,
        userList: [],
      });
    });

    it('isGameStartingがtrueの場合、ユーザーがキャンセルされないこと', () => {
      entry.isGameStarting = true;
      const socketId = 'socket1';
      const userId = 'user1';

      entry.users = [{ socketId, userId }];

      entry.cancel(socketId);

      expect(entry.users).toContainEqual({ socketId, userId });
    });
  });

  // 3. userListメソッドのテスト
  describe('userListメソッド', () => {
    it('現在のユーザーリストが正しく取得されること', () => {
      entry.users = [
        { socketId: 'socket1', userId: 'user1' },
        { socketId: 'socket2', userId: 'user2' },
      ];

      const userList = entry.userList();

      expect(userList).toEqual(['user1', 'user2']);
    });
  });

  // 4. entryUpdateメソッドのテスト
  describe('entryUpdateメソッド', () => {
    it('entryUpdateイベントが正しく発火されること', () => {
      entry.users = [
        { socketId: 'socket1', userId: 'user1' },
        { socketId: 'socket2', userId: 'user2' },
      ];

      // entryUpdateイベントをモック
      const entryUpdateMock = jest.fn();
      entryEvents.on('entryUpdate', entryUpdateMock);

      entry.entryUpdate();

      expect(entryUpdateMock).toHaveBeenCalledWith({
        channelId,
        userList: ['user1', 'user2'],
      });
    });
  });

  // 5. startGameメソッドのテスト
  describe('startGameメソッド', () => {
    it('ゲームが正常に開始され、データベースにゲームが作成されること', async () => {
      entry.users = [
        { socketId: 'socket1', userId: 'user1' },
        { socketId: 'socket2', userId: 'user2' },
      ];

      // モックの設定
      const gameId = 'game123';
      Game.create.mockResolvedValue({ _id: gameId });
      Game.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue({ _id: gameId, users: [], channel: channelId }),
      });

      // entryEventsのgameStartイベントをモック
      const gameStartMock = jest.fn();
      entryEvents.on('gameStart', gameStartMock);

      // resetメソッドをモック
      entry.reset = jest.fn();

      await entry.startGame();

      expect(Game.create).toHaveBeenCalledWith({
        users: ['user1', 'user2'],
        channel: channelId,
        result: 'running',
      });

      expect(Game.findById).toHaveBeenCalledWith(gameId);
      expect(GameState.createGame).toHaveBeenCalledWith({ _id: gameId, users: [], channel: channelId });

      expect(gameStartMock).toHaveBeenCalledWith({
        socketIds: ['socket1', 'socket2'],
        gameId,
      });

      expect(entry.reset).toHaveBeenCalled();
    });

    it('ゲームの作成中にエラーが発生した場合、gameCreationFailedが呼び出されること', async () => {
      entry.users = [
        { socketId: 'socket1', userId: 'user1' },
      ];

      // モックの設定
      const error = new Error('Database error');
      Game.create.mockRejectedValue(error);

      // gameCreationFailedメソッドをモック
      entry.gameCreationFailed = jest.fn();

      // resetメソッドをモック
      entry.reset = jest.fn();

      await entry.startGame();

      expect(entry.gameCreationFailed).toHaveBeenCalledWith(error);
      expect(entry.reset).toHaveBeenCalled();
    });
  });

  // 6. gameCreationFailedメソッドのテスト
  describe('gameCreationFailedメソッド', () => {
    it('エラーメッセージが正しくログに出力されること', () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Test error');
      entry.gameCreationFailed(error);

      expect(consoleErrorMock).toHaveBeenCalledWith('error:', 'Test error');

      consoleErrorMock.mockRestore();
    });

    it('gameCreationFailedイベントが正しく発火されること', () => {
      const error = new Error('Test error');

      // gameCreationFailedイベントをモック
      const gameCreationFailedMock = jest.fn();
      entryEvents.on('gameCreationFailed', gameCreationFailedMock);

      entry.gameCreationFailed(error);

      expect(gameCreationFailedMock).toHaveBeenCalledWith({
        channelId,
      });
    });
  });

  // 7. resetメソッドのテスト
  describe('resetメソッド', () => {
    it('usersが空の配列にリセットされること', () => {
      entry.users = [
        { socketId: 'socket1', userId: 'user1' },
      ];

      entry.reset();

      expect(entry.users).toEqual([]);
    });

    it('isGameStartingがfalseにリセットされること', () => {
      entry.isGameStarting = true;

      entry.reset();

      expect(entry.isGameStarting).toBe(false);
    });
  });
});
