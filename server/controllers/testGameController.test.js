// tests/getVoteHistory.test.js
const { getVoteHistory } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      votes: {
        getVoteHistory: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'villager' },
        { _id: 'player2', status: 'alive', role: 'villager' },
      ],
      phase: { currentDay: 1, currentPhase: 'day' },
    },
  },
}));

describe('getVoteHistory', () => {
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
    getVoteHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.params.gameId = 'invalidGameId';
    getVoteHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('投票履歴が取得できない場合、403エラーを返す', () => {
    games['game123'].votes.getVoteHistory.mockReturnValue(null);
    getVoteHistory(req, res);
    expect(games['game123'].votes.getVoteHistory).toHaveBeenCalledWith(games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: errors.VOTE_HISTORY_NOT_FOUND });
  });

  test('正常に投票履歴が取得された場合、200ステータスと投票履歴を返す', () => {
    const mockVoteHistory = {
      1: {
        'player2': ['player1'],
      },
    };
    games['game123'].votes.getVoteHistory.mockReturnValue(mockVoteHistory);
    getVoteHistory(req, res);
    expect(games['game123'].votes.getVoteHistory).toHaveBeenCalledWith(games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockVoteHistory);
  });

  test('予期しないエラーが発生した場合、500エラーを返す', () => {
    games['game123'].votes.getVoteHistory.mockImplementation(() => {
      throw new Error('予期せぬエラー');
    });
    getVoteHistory(req, res);
    expect(games['game123'].votes.getVoteHistory).toHaveBeenCalledWith(games['game123'].phase);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
