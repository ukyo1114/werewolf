// tests/receiveGuardTarget.test.js
const { receiveGuardTarget } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      guard: {
        receiveGuardTarget: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'hunter' },
        { _id: 'player2', status: 'alive', role: 'villager' },
        { _id: 'player3', status: 'dead', role: 'villager' },
        { _id: 'player4', status: 'alive', role: 'hunter' },
      ],
      phase: { currentDay: 1, currentPhase: 'night' },
    },
  },
}));

describe('receiveGuardTarget', () => {
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
    // gameId が欠如している場合
    req.body.gameId = undefined;
    receiveGuardTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });

    // selectedUser が欠如している場合
    res.status.mockClear();
    res.json.mockClear();
    req.body.gameId = 'game123';
    req.body.selectedUser = undefined;
    receiveGuardTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.body.gameId = 'invalidGameId';
    receiveGuardTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('無効なガードターゲット（フェーズが night でない場合）、400エラーを返す', () => {
    games['game123'].phase.currentPhase = 'day';
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_GUARD);
    });

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_GUARD });
  });

  test('無効なガードターゲット（hunter でない場合）、400エラーを返す', () => {
    // userId のプレイヤーが hunter でない場合
    req.user._id = 'player2'; // player2 は villager
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_GUARD);
    });

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player2',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_GUARD });
  });

  test('無効なガードターゲット（ターゲットが alive でない場合）、400エラーを返す', () => {
    // target が alive でない場合
    req.body.selectedUser = 'player3'; // player3 は dead
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_GUARD);
    });

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player1',
      'player3',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_GUARD });
  });

  test('無効なガードターゲット（ターゲットが hunter の場合）、400エラーを返す', () => {
    // target が hunter の場合
    req.body.selectedUser = 'player4'; // player4 は hunter
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_GUARD);
    });

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player1',
      'player4',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_GUARD });
  });

  test('正常にガードターゲットが指定された場合、200ステータスとメッセージを返す', () => {
    // 正常な動作をモック（特に何も投げない）
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {});

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: messages.GUARD_COMPLETED });
  });

  test('サーバーエラーが発生した場合、500エラーを返す', () => {
    games['game123'].guard.receiveGuardTarget.mockImplementation(() => {
      throw new Error('サーバーエラー');
    });

    receiveGuardTarget(req, res);
    expect(games['game123'].guard.receiveGuardTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
