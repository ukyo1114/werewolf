// tests/getMediumResult.test.js
const { getMediumResult } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

// モックの設定
jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      medium: {
        getMediumResult: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'seer' },
        { _id: 'player2', status: 'alive', role: 'villager' },
      ],
      phase: { currentDay: 1, currentPhase: 'day' },
    },
  },
}));

describe('getMediumResult', () => {
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
    getMediumResult(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.params.gameId = 'invalidGameId';
    getMediumResult(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('占い結果が取得できない場合、403エラーを返す', () => {
    games['game123'].medium.getMediumResult.mockReturnValue(null);
    getMediumResult(req, res);
    expect(games['game123'].medium.getMediumResult).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MEDIUM_RESULT_NOT_FOUND });
  });

  test('正常に占い結果が取得された場合、200ステータスと占い結果を返す', () => {
    const mockMediumResult = {
      1: {
        'player2': 'unknown',
      },
    };
    games['game123'].medium.getMediumResult.mockReturnValue(mockMediumResult);
    getMediumResult(req, res);
    expect(games['game123'].medium.getMediumResult).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMediumResult);
  });

  test('予期せぬエラーが発生した場合、500エラーを返す', () => {
    games['game123'].medium.getMediumResult.mockImplementation(() => {
      throw new Error('予期せぬエラー');
    });
    getMediumResult(req, res);
    expect(games['game123'].medium.getMediumResult).toHaveBeenCalledWith('player1', games['game123'].players, games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
