// server/tests/classes/attackManager.test.js

const AttackManager = require('../../classes/AttackManager');
const _ = require('lodash');
const { errors } = require('../../messages');

jest.mock('lodash');

describe('AttackManager', () => {
  let playersMock;
  let phaseMock;
  let guardMock;
  let attackManager;

  beforeEach(() => {
    // Mock players
    playersMock = {
      players: new Map(),
      getFilteredPlayers: jest.fn(),
      kill: jest.fn(),
    };

    // Mock phase
    phaseMock = {
      currentDay: 1,
      currentPhase: 'night',
    };

    // Mock guard
    guardMock = {
      guard: jest.fn(),
    };

    // Initialize AttackManager
    attackManager = new AttackManager(playersMock, phaseMock, guardMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('receiveAttackTarget', () => {
    it('正しい条件下で攻撃ターゲットが記録されること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      // Setup players
      playersMock.players.set(playerId, { status: 'alive', role: 'werewolf' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      attackManager.receiveAttackTarget(playerId, targetId);

      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toEqual({ playerId: targetId });
    });

    it('フェーズが夜でない場合、エラーがスローされること', () => {
      phaseMock.currentPhase = 'day';
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'werewolf' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    it('攻撃者が生存していない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'dead', role: 'werewolf' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    it('攻撃者が人狼でない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'villager' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    it('ターゲットが生存していない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'werewolf' });
      playersMock.players.set(targetId, { status: 'dead', role: 'villager' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    it('ターゲットが人狼の場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'werewolf' });
      playersMock.players.set(targetId, { status: 'alive', role: 'werewolf' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    // エッジケース：攻撃者が存在しない場合
    it('攻撃者が存在しない場合、エラーがスローされること', () => {
      const playerId = 'invalidPlayer';
      const targetId = 'player2';

      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });

    // エッジケース：ターゲットが存在しない場合
    it('ターゲットが存在しない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'invalidTarget';

      playersMock.players.set(playerId, { status: 'alive', role: 'werewolf' });

      expect(() => {
        attackManager.receiveAttackTarget(playerId, targetId);
      }).toThrow(errors.INVALID_ATTACK);
    });
  });

  describe('attack', () => {
    it('attackHistoryにターゲットが存在し、ガードがブロックしない場合、ターゲットが殺害されること', () => {
      const targetId = 'player2';

      // Setup attack history
      attackManager.attackHistory.set(phaseMock.currentDay, { playerId: targetId });

      // Mock guard to not block
      guardMock.guard.mockReturnValue(false);

      // Setup players
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      const result = attackManager.attack();

      expect(guardMock.guard).toHaveBeenCalledWith(targetId);
      expect(playersMock.kill).toHaveBeenCalledWith(targetId);
      expect(result).toEqual({ status: 'alive', role: 'villager' });
    });

    it('attackHistoryにターゲットが存在し、ガードがブロックする場合、ターゲットが殺害されないこと', () => {
      const targetId = 'player2';

      // Setup attack history
      attackManager.attackHistory.set(phaseMock.currentDay, { playerId: targetId });

      // Mock guard to block
      guardMock.guard.mockReturnValue(true);

      // Setup players
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      const result = attackManager.attack();

      expect(guardMock.guard).toHaveBeenCalledWith(targetId);
      expect(playersMock.kill).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('attackHistoryにターゲットが存在せず、getRandomAttackTargetがターゲットを選び、ガードがブロックしない場合、ターゲットが殺害されること', () => {
      phaseMock.currentDay = 2;

      // Mock getRandomAttackTarget
      const randomTargetId = 'player3';
      attackManager.getRandomAttackTarget = jest.fn().mockReturnValue(randomTargetId);

      // Mock guard to not block
      guardMock.guard.mockReturnValue(false);

      // Setup players
      playersMock.players.set(randomTargetId, { status: 'alive', role: 'villager' });

      const result = attackManager.attack();

      expect(attackManager.getRandomAttackTarget).toHaveBeenCalled();
      expect(guardMock.guard).toHaveBeenCalledWith(randomTargetId);
      expect(playersMock.kill).toHaveBeenCalledWith(randomTargetId);
      expect(result).toEqual({ status: 'alive', role: 'villager' });
    });

    it('attackHistoryにターゲットが存在せず、getRandomAttackTargetがターゲットを選び、ガードがブロックする場合、ターゲットが殺害されないこと', () => {
      phaseMock.currentDay = 2;

      // Mock getRandomAttackTarget
      const randomTargetId = 'player3';
      attackManager.getRandomAttackTarget = jest.fn().mockReturnValue(randomTargetId);

      // Mock guard to block
      guardMock.guard.mockReturnValue(true);

      // Setup players
      playersMock.players.set(randomTargetId, { status: 'alive', role: 'villager' });

      const result = attackManager.attack();

      expect(attackManager.getRandomAttackTarget).toHaveBeenCalled();
      expect(guardMock.guard).toHaveBeenCalledWith(randomTargetId);
      expect(playersMock.kill).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('attackHistoryにターゲットが存在せず、getRandomAttackTargetがエラーをスローする場合、attackメソッドもエラーをスローすること', () => {
      phaseMock.currentDay = 2;

      // Mock getRandomAttackTarget to throw error
      attackManager.getRandomAttackTarget = jest.fn().mockImplementation(() => {
        throw new Error('Random target selection failed');
      });

      expect(() => {
        attackManager.attack();
      }).toThrow('Random target selection failed');

      expect(attackManager.getRandomAttackTarget).toHaveBeenCalled();
      expect(guardMock.guard).not.toHaveBeenCalled();
      expect(playersMock.kill).not.toHaveBeenCalled();
    });

    it('guard.guardがエラーをスローする場合、attackメソッドもエラーをスローすること', () => {
      const targetId = 'player2';

      // Setup attack history
      attackManager.attackHistory.set(phaseMock.currentDay, { playerId: targetId });

      // Mock guard to throw error
      guardMock.guard.mockImplementation(() => {
        throw new Error('Guard malfunction');
      });

      // Setup players
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        attackManager.attack();
      }).toThrow('Guard malfunction');

      expect(guardMock.guard).toHaveBeenCalledWith(targetId);
      expect(playersMock.kill).not.toHaveBeenCalled();
    });
  });

  describe('getRandomAttackTarget', () => {
    it('生存中の非人狼プレイヤーからランダムにターゲットを選び、攻撃履歴に記録すること', () => {
      phaseMock.currentDay = 1;

      // フィルタリングされたプレイヤーのセットアップ
      const aliveNonWerewolves = [
        { _id: 'player1', status: 'alive', role: 'villager' },
        { _id: 'player2', status: 'alive', role: 'seer' },
        { _id: 'player3', status: 'alive', role: 'doctor' },
      ];
      playersMock.getFilteredPlayers.mockReturnValue(aliveNonWerewolves);

      // lodash.sampleをモックして特定のプレイヤーを返す
      _.sample.mockReturnValue(aliveNonWerewolves[1]); // player2

      const result = attackManager.getRandomAttackTarget();

      // getFilteredPlayersが正しい関数で呼び出されていることを確認
      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));

      // lodash.sampleがフィルタリングされたプレイヤー配列で呼び出されていることを確認
      expect(_.sample).toHaveBeenCalledWith(aliveNonWerewolves);

      // attackHistoryが正しく設定されていることを確認
      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toEqual({ playerId: 'player2' });

      // メソッドが正しいIDを返していることを確認
      expect(result).toBe('player2');
    });

    it('生存中の非人狼プレイヤーが1人のみ存在する場合、正しく選ばれること', () => {
      phaseMock.currentDay = 2;

      // フィルタリングされたプレイヤーのセットアップ（1人）
      const aliveNonWerewolves = [
        { _id: 'player1', status: 'alive', role: 'villager' },
      ];
      playersMock.getFilteredPlayers.mockReturnValue(aliveNonWerewolves);

      // lodash.sampleをモックしてそのプレイヤーを返す
      _.sample.mockReturnValue(aliveNonWerewolves[0]); // player1

      const result = attackManager.getRandomAttackTarget();

      // getFilteredPlayersが正しい関数で呼び出されていることを確認
      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));

      // lodash.sampleがフィルタリングされたプレイヤー配列で呼び出されていることを確認
      expect(_.sample).toHaveBeenCalledWith(aliveNonWerewolves);

      // attackHistoryが正しく設定されていることを確認
      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toEqual({ playerId: 'player1' });

      // メソッドが正しいIDを返していることを確認
      expect(result).toBe('player1');
    });

    it('有効な攻撃ターゲットが存在しない場合、エラーをスローすること', () => {
      phaseMock.currentDay = 3;

      // フィルタリングされたプレイヤーが存在しない（空配列）
      const noTargets = [];
      playersMock.getFilteredPlayers.mockReturnValue(noTargets);

      // lodash.sampleをモックしてundefinedを返す
      _.sample.mockReturnValue(undefined);

      expect(() => {
        attackManager.getRandomAttackTarget();
      }).toThrow(); // 具体的なエラーメッセージを期待する場合は引数に指定

      // getFilteredPlayersが正しい関数で呼び出されていることを確認
      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));

      // lodash.sampleがフィルタリングされたプレイヤー配列で呼び出されていることを確認
      expect(_.sample).toHaveBeenCalledWith(noTargets);

      // attackHistoryに未定義が設定されていることを確認
      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toBeUndefined();
    });

    it('getFilteredPlayersがエラーをスローする場合、attackメソッドもエラーをスローすること', () => {
      phaseMock.currentDay = 4;

      // getFilteredPlayersをモックしてエラーをスローする
      playersMock.getFilteredPlayers.mockImplementation(() => {
        throw new Error('Filtering failed');
      });

      expect(() => {
        attackManager.getRandomAttackTarget();
      }).toThrow('Filtering failed');

      // getFilteredPlayersが正しい関数で呼び出されていることを確認
      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));

      // lodash.sampleが呼び出されていないことを確認
      expect(_.sample).not.toHaveBeenCalled();

      // attackHistoryに設定されていないことを確認
      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toBeUndefined();
    });

    it('attackHistoryに既にcurrentDayの攻撃ターゲットが記録されている場合、新たにターゲットを選択しないこと', () => {
      phaseMock.currentDay = 5;

      // attackHistoryに既にターゲットが記録されている
      attackManager.attackHistory.set(phaseMock.currentDay, { playerId: 'player2' });

      // getFilteredPlayersが呼ばれるが、_.sampleは呼ばれない
      const aliveNonWerewolves = [
        { _id: 'player1', status: 'alive', role: 'villager' },
        { _id: 'player2', status: 'alive', role: 'seer' },
      ];
      playersMock.getFilteredPlayers.mockReturnValue(aliveNonWerewolves);

      // _.sampleは呼ばれないようにモック
      _.sample.mockReturnValue('player1');

      const result = attackManager.getRandomAttackTarget();

      // getFilteredPlayersが呼ばれていることを確認
      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));

      // _.sampleが呼ばれていないことを確認
      expect(_.sample).not.toHaveBeenCalled();

      // attackHistoryが更新されていないことを確認
      expect(attackManager.attackHistory.get(phaseMock.currentDay)).toEqual({ playerId: 'player2' });

      // メソッドが既に記録されているターゲットIDを返すことを確認
      expect(result).toBe('player2');
    });
  });

  describe('getAttackHistory', () => {
    it('プレイヤーが人狼であり、フェーズが「night」の場合、currentDayの攻撃を除外して過去の攻撃履歴を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });
      attackManager.attackHistory.set(2, { playerId: 'player3' });
      attackManager.attackHistory.set(3, { playerId: 'player4' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
      });
    });

    it('プレイヤーが人狼であり、フェーズが「finished」の場合、currentDayの攻撃を含めてすべての攻撃履歴を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });
      attackManager.attackHistory.set(2, { playerId: 'player3' });
      attackManager.attackHistory.set(3, { playerId: 'player4' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
        3: { playerId: 'player4' },
      });
    });

    it('プレイヤーが人狼であり、フェーズが「finished」でattackHistoryにcurrentDayのみが存在する場合、currentDayの攻撃を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(3, { playerId: 'player4' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({
        3: { playerId: 'player4' },
      });
    });

    it('攻撃履歴が空の場合、空のオブジェクトを返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history - empty

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({});
    });

    // 異常系

    it('プレイヤーが人狼でない場合、nullを返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'villager', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toBeNull();
    });

    it('現在のフェーズが「pre」の場合、nullを返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'pre';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toBeNull();
    });

    it('プレイヤーが存在しない場合、nullを返すこと', () => {
      const playerId = 'invalidPlayer';

      // Setup players - player not added

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toBeNull();
    });

    // エッジケース

    it('attackHistoryにcurrentDay以外の日も存在し、フェーズが「finished」の場合、すべての日の攻撃が返されること', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });
      attackManager.attackHistory.set(2, { playerId: 'player3' });
      attackManager.attackHistory.set(3, { playerId: 'player4' }); // currentDay
      attackManager.attackHistory.set(4, { playerId: 'player5' }); // additional day

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
        3: { playerId: 'player4' },
        4: { playerId: 'player5' },
      });
    });

    it('attackHistoryにcurrentDayの攻撃が存在しない場合、過去の攻撃のみを返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'werewolf', status: 'alive' });

      // Setup attack history
      attackManager.attackHistory.set(1, { playerId: 'player2' });
      attackManager.attackHistory.set(2, { playerId: 'player3' });
      // No attack on currentDay (3)

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = attackManager.getAttackHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
      });
    });
  });
});
