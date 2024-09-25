// tests/receiveVote.test.js
const { receiveVote } = require('../controllers/gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      votes: {
        receiveVote: jest.fn(),
      },
      players: {}, // 必要に応じてモック
      phase: { currentDay: 1, currentPhase: 'day' }, // モックされたフェーズ
    },
  },
}));

describe('receiveVote', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'player1' },
      body: {
        gameId: 'game123',
        selectedUser: 'player2',
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

  test('ゲームIDまたは選択ユーザーが提供されていない場合、400エラーを返す', () => {
    req.body.gameId = undefined;

    receiveVote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });

    // 他の欠如ケース
    res.status.mockClear();
    res.json.mockClear();

    req.body.gameId = 'game123';
    req.body.selectedUser = undefined;

    receiveVote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.body.gameId = 'invalidGameId';

    receiveVote(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('投票が無効な場合（プレイヤーが存在しない）、400エラーを返す', () => {
    games['game123'].votes.receiveVote.mockImplementation(() => {
      throw new Error(errors.INVALID_VOTE);
    });

    receiveVote(req, res);

    expect(games['game123'].votes.receiveVote).toHaveBeenCalledWith({
      voter: 'player1',
      votee: 'player2',
    }, expect.anything(), expect.anything());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_VOTE });
  });

  test('投票が無効な場合（プレイヤーのステータスが不正）、400エラーを返す', () => {
    games['game123'].votes.receiveVote.mockImplementation(() => {
      throw new Error(errors.INVALID_VOTE);
    });

    receiveVote(req, res);

    expect(games['game123'].votes.receiveVote).toHaveBeenCalledWith({
      voter: 'player1',
      votee: 'player2',
    }, expect.anything(), expect.anything());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_VOTE });
  });

  test('既に投票済みの場合、400エラーを返す', () => {
    games['game123'].votes.receiveVote.mockImplementation(() => {
      throw new Error(errors.ALREADY_VOTED);
    });

    receiveVote(req, res);

    expect(games['game123'].votes.receiveVote).toHaveBeenCalledWith({
      voter: 'player1',
      votee: 'player2',
    }, expect.anything(), expect.anything());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.ALREADY_VOTED });
  });

  test('正常に投票が完了した場合、200ステータスとメッセージを返す', () => {
    // 正常な動作をモック（特に何も投げない）
    games['game123'].votes.receiveVote.mockImplementation(() => {});

    receiveVote(req, res);

    expect(games['game123'].votes.receiveVote).toHaveBeenCalledWith({
      voter: 'player1',
      votee: 'player2',
    }, expect.anything(), expect.anything());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: messages.VOTE_COMPLETED });
  });

  test('サーバーエラーが発生した場合、500エラーを返す', () => {
    games['game123'].votes.receiveVote.mockImplementation(() => {
      throw new Error('サーバーエラー');
    });

    receiveVote(req, res);

    expect(games['game123'].votes.receiveVote).toHaveBeenCalledWith({
      voter: 'player1',
      votee: 'player2',
    }, expect.anything(), expect.anything());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
