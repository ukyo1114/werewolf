// tests/getGuardHistory.test.js
const { getGuardHistory } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

// モックの設定
jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      guard: {
        getGuardHistory: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'hunter' },
        { _id: 'player2', status: 'alive', role: 'villager' },
      ],
      phase: { currentDay: 1, currentPhase: 'day' },
    },
  },
}));

describe('getGuardHistory', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'player1' },
      params: {
        gameId: 'game123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('ゲームIDが提供されていない場合、400エラーを返す', () => {
    req.params.gameId = undefined;
    getGuardHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.params.gameId = 'invalidGameId';
    getGuardHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('護衛履歴が取得できない場合、403エラーを返す', () => {
    games['game123'].guard.getGuardHistory.mockReturnValue(null);
    getGuardHistory(req, res);
    expect(games['game123'].guard.getGuardHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GUARD_HISTORY_NOT_FOUND });
  });

  test('正常に護衛履歴が取得された場合、200ステータスと護衛履歴を返す', () => {
    const mockGuardHistory = {
      1: {
        'player2': ['player1'],
      },
    };
    games['game123'].guard.getGuardHistory.mockReturnValue(mockGuardHistory);
    getGuardHistory(req, res);
    expect(games['game123'].guard.getGuardHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockGuardHistory);
  });

  test('予期せぬエラーが発生した場合、500エラーを返す', () => {
    games['game123'].guard.getGuardHistory.mockImplementation(() => {
      throw new Error('予期せぬエラー');
    });
    getGuardHistory(req, res);
    expect(games['game123'].guard.getGuardHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
