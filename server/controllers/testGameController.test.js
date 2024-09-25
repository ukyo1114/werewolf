// tests/receiveAttackTarget.test.js
const { receiveAttackTarget } = require('./gameController');
const { games } = require('../classes/GameState');
const { errors, messages } = require('../messages');

jest.mock('../classes/GameState', () => ({
  games: {
    'game123': {
      attack: {
        receiveAttackTarget: jest.fn(),
      },
      players: [
        { _id: 'player1', status: 'alive', role: 'werewolf' },
        { _id: 'player2', status: 'alive', role: 'villager' },
        { _id: 'player3', status: 'dead', role: 'villager' },
        { _id: 'player4', status: 'alive', role: 'werewolf' },
      ],
      phase: { currentDay: 1, currentPhase: 'night' },
    },
  },
}));

describe('receiveAttackTarget', () => {
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
    // gameIdが欠如している場合
    req.body.gameId = undefined;
    receiveAttackTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });

    // selectedUserが欠如している場合
    res.status.mockClear();
    res.json.mockClear();
    req.body.gameId = 'game123';
    req.body.selectedUser = undefined;
    receiveAttackTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.MISSING_DATA });
  });

  test('ゲームが見つからない場合、404エラーを返す', () => {
    req.body.gameId = 'invalidGameId';
    receiveAttackTarget(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: errors.GAME_NOT_FOUND });
  });

  test('無効な攻撃ターゲット（フェーズがnightでない場合）、400エラーを返す', () => {
    games['game123'].phase.currentPhase = 'day';
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_ATTACK);
    });

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_ATTACK });
  });

  test('無効な攻撃ターゲット（werewolfでない場合）、400エラーを返す', () => {
    // userIdのプレイヤーがwerewolfでない場合
    req.user._id = 'player2'; // player2はvillager
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_ATTACK);
    });

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player2',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_ATTACK });
  });

  test('無効な攻撃ターゲット（ターゲットがaliveでない場合）、400エラーを返す', () => {
    // targetがaliveでない場合
    req.body.selectedUser = 'player3'; // player3はdead
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_ATTACK);
    });

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player1',
      'player3',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_ATTACK });
  });

  test('無効な攻撃ターゲット（ターゲットがwerewolfの場合）、400エラーを返す', () => {
    // targetがwerewolfの場合
    req.body.selectedUser = 'player4'; // player4はwerewolf
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {
      throw new Error(errors.INVALID_ATTACK);
    });

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player1',
      'player4',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errors.INVALID_ATTACK });
  });

  test('正常に攻撃ターゲットが指定された場合、200ステータスとメッセージを返す', () => {
    // 正常な動作をモック（特に何も投げない）
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {});

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: messages.ATTACK_COMPLETED });
  });

  test('サーバーエラーが発生した場合、500エラーを返す', () => {
    games['game123'].attack.receiveAttackTarget.mockImplementation(() => {
      throw new Error('サーバーエラー');
    });

    receiveAttackTarget(req, res);
    expect(games['game123'].attack.receiveAttackTarget).toHaveBeenCalledWith(
      'player1',
      'player2',
      games['game123'].players,
      games['game123'].phase
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errors.SERVER_ERROR });
  });
});
