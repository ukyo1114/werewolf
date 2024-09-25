// tests/getAttackHistory.test.js
const { getAttackHistory } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

// モックの設定
jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      attack: {
        getAttackHistory: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'werewolf' },
        { _id: 'player2', status: 'alive', role: 'villager' },
      ],
      phase: { currentDay: 1, currentPhase: 'night' },
    },
  },
}));

describe('getAttackHistory', () => {
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
    getAttackHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.params.gameId = 'invalidGameId';
    getAttackHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('攻撃履歴が取得できない場合、403エラーを返す', () => {
    games['game123'].attack.getAttackHistory.mockReturnValue(null);
    getAttackHistory(req, res);
    expect(games['game123'].attack.getAttackHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: errors.ATTACK_HISTORY_NOT_FOUND });
  });

  test('正常に攻撃履歴が取得された場合、200ステータスと攻撃履歴を返す', () => {
    const mockAttackHistory = {
      1: {
        'player2': ['player1'],
      },
    };
    games['game123'].attack.getAttackHistory.mockReturnValue(mockAttackHistory);
    getAttackHistory(req, res);
    expect(games['game123'].attack.getAttackHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttackHistory);
  });

  test('予期せぬエラーが発生した場合、500エラーを返す', () => {
    games['game123'].attack.getAttackHistory.mockImplementation(() => {
      throw new Error('予期せぬエラー');
    });
    getAttackHistory(req, res);
    expect(games['game123'].attack.getAttackHistory).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
