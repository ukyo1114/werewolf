// server/tests/classes/guardManager.test.js

const GuardManager = require('../../classes/GuardManager');
const _ = require('lodash');
const { errors } = require('../../messages');

jest.mock('lodash');

describe('GuardManager', () => {
  let playersMock;
  let phaseMock;
  let guardManager;

  beforeEach(() => {
    // Mock players
    playersMock = {
      players: new Map(),
      getFilteredPlayers: jest.fn(),
      findPlayerByRole: jest.fn(),
    };

    // Mock phase
    phaseMock = {
      currentDay: 1,
      currentPhase: 'night',
    };

    // Initialize GuardManager
    guardManager = new GuardManager(playersMock, phaseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('receiveGuardTarget', () => {
    it('正しい条件下でターゲットが記録されること', () => {
      const playerId = 'hunter1';
      const targetId = 'player2';

      // Setup players
      playersMock.players.set(playerId, { status: 'alive', role: 'hunter' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      guardManager.receiveGuardTarget(playerId, targetId);

      expect(guardManager.guardHistory.get(phaseMock.currentDay)).toEqual({
        playerId: targetId,
      });
    });

    it('現在のフェーズが「night」でない場合、エラーがスローされること', () => {
      phaseMock.currentPhase = 'day';
      const playerId = 'hunter1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'hunter' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('ハンターが生存していない場合、エラーがスローされること', () => {
      const playerId = 'hunter1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'dead', role: 'hunter' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('ハンターの役割が「hunter」でない場合、エラーがスローされること', () => {
      const playerId = 'hunter1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'villager' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('ターゲットが生存していない場合、エラーがスローされること', () => {
      const playerId = 'hunter1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'hunter' });
      playersMock.players.set(targetId, { status: 'dead', role: 'villager' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('ターゲットの役割が「hunter」である場合、エラーがスローされること', () => {
      const playerId = 'hunter1';
      const targetId = 'hunter2';

      playersMock.players.set(playerId, { status: 'alive', role: 'hunter' });
      playersMock.players.set(targetId, { status: 'alive', role: 'hunter' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('`playerId`が存在しない場合、エラーがスローされること', () => {
      const playerId = 'invalidHunter';
      const targetId = 'player2';

      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });

    it('`targetId`が存在しない場合、エラーがスローされること', () => {
      const playerId = 'hunter1';
      const targetId = 'invalidPlayer';

      playersMock.players.set(playerId, { status: 'alive', role: 'hunter' });

      expect(() => {
        guardManager.receiveGuardTarget(playerId, targetId);
      }).toThrow(errors.INVALID_GUARD);
    });
  });

  describe('guard', () => {
    it('ハンターが生存しており、`guardHistory`にターゲットが存在する場合、正しく判定されること', () => {
      const currentDay = phaseMock.currentDay;
      const hunter = { _id: 'hunter1', status: 'alive', role: 'hunter' };
      const targetId = 'player2';

      playersMock.findPlayerByRole.mockReturnValue(hunter);
      playersMock.players.set(targetId, { _id: targetId, status: 'alive', role: 'villager' });

      guardManager.guardHistory.set(currentDay, { playerId: targetId });

      const result = guardManager.guard(targetId);

      expect(result).toBe(true);
    });

    it('ハンターが生存しており、`guardHistory`にターゲットが存在しない場合、ランダムに選ばれたターゲットと比較されること', () => {
      const currentDay = phaseMock.currentDay;
      const hunter = { _id: 'hunter1', status: 'alive', role: 'hunter' };
      const randomTargetId = 'player3';
      const attackTargetId = 'player4';

      playersMock.findPlayerByRole.mockReturnValue(hunter);
      playersMock.players.set(randomTargetId, { _id: randomTargetId, status: 'alive', role: 'villager' });
      playersMock.players.set(attackTargetId, { _id: attackTargetId, status: 'alive', role: 'villager' });

      // Mock getRandomGuardTarget
      guardManager.getRandomGuardTarget = jest.fn().mockReturnValue(randomTargetId);

      const result = guardManager.guard(attackTargetId);

      expect(guardManager.getRandomGuardTarget).toHaveBeenCalled();
      expect(result).toBe(false); // attackTargetId !== randomTargetId
    });

    it('ハンターが生存していない場合、`guard`メソッドは何も返さないこと', () => {
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'hunter1', status: 'dead', role: 'hunter' });

      const result = guardManager.guard('player2');

      expect(result).toBeUndefined();
    });
  });

  describe('getRandomGuardTarget', () => {
    it('生存中の非ハンターターゲットからランダムに選び、`guardHistory`に記録すること', () => {
      const currentDay = phaseMock.currentDay;
      const randomTarget = { _id: 'player2', status: 'alive', role: 'villager' };

      // Mock getFilteredPlayers
      playersMock.getFilteredPlayers.mockReturnValue([randomTarget]);

      // Mock lodash.sample to return specific player
      _.sample.mockReturnValue(randomTarget);

      const result = guardManager.getRandomGuardTarget();

      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));
      expect(_.sample).toHaveBeenCalledWith([randomTarget]);
      expect(guardManager.guardHistory.get(currentDay)).toEqual({
        playerId: randomTarget._id,
      });
      expect(result).toBe(randomTarget._id);
    });

    it('有効なガードターゲットが存在しない場合、エラーがスローされること', () => {
      const currentDay = phaseMock.currentDay;

      // Mock getFilteredPlayers to return empty array
      playersMock.getFilteredPlayers.mockReturnValue([]);

      // Mock lodash.sample to return undefined
      _.sample.mockReturnValue(undefined);

      expect(() => {
        guardManager.getRandomGuardTarget();
      }).toThrow();
    });
  });

  describe('getGuardHistory', () => {
    it('プレイヤーがハンターであり、フェーズが「night」の場合、現在の日の守り歴を除外して過去の守り歴を返すこと', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });
      guardManager.guardHistory.set(2, { playerId: 'player3' });
      guardManager.guardHistory.set(3, { playerId: 'player4' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
      });
    });

    it('プレイヤーがハンターであり、フェーズが「finished」の場合、現在の日の守り歴も含めてすべての守り歴を返すこと', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });
      guardManager.guardHistory.set(2, { playerId: 'player3' });
      guardManager.guardHistory.set(3, { playerId: 'player4' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
        3: { playerId: 'player4' },
      });
    });

    it('攻撃履歴が空の場合、空のオブジェクトを返すこと', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history - empty

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toEqual({});
    });

    it('プレイヤーがハンターでない場合、`null`を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'villager', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toBeNull();
    });

    it('現在のフェーズが「pre」の場合、`null`を返すこと', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'pre';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toBeNull();
    });

    it('`playerId`が存在しない場合、`null`を返すこと', () => {
      const playerId = 'invalidHunter';

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toBeNull();
    });

    // エッジケース

    it('`guardHistory`に現在の日以外の守り歴も存在し、フェーズが「finished」の場合、すべての守り歴が返されること', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });
      guardManager.guardHistory.set(2, { playerId: 'player3' });
      guardManager.guardHistory.set(3, { playerId: 'player4' }); // currentDay
      guardManager.guardHistory.set(4, { playerId: 'player5' }); // additional day

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
        3: { playerId: 'player4' },
        4: { playerId: 'player5' },
      });
    });

    it('`guardHistory`に現在の日の守り歴が存在しない場合、過去の守り歴のみが返されること', () => {
      const playerId = 'hunter1';

      // Setup players
      playersMock.players.set(playerId, { role: 'hunter', status: 'alive' });

      // Setup guard history
      guardManager.guardHistory.set(1, { playerId: 'player2' });
      guardManager.guardHistory.set(2, { playerId: 'player3' });
      // No guard on currentDay (3)

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = guardManager.getGuardHistory(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2' },
        2: { playerId: 'player3' },
      });
    });
  });
});
