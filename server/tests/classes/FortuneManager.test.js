// server/tests/classes/fortuneManager.test.js

const FortuneManager = require('../../classes/FortuneManager');
const _ = require('lodash');
const { errors } = require('../../messages');

jest.mock('lodash');

describe('FortuneManager', () => {
  let playersMock;
  let phaseMock;
  let fortuneManager;

  beforeEach(() => {
    // Mock players
    playersMock = {
      players: new Map(),
      getFilteredPlayers: jest.fn(),
      findPlayerByRole: jest.fn(),
      kill: jest.fn(), // もしkillメソッドが必要なら
    };

    // Mock phase
    phaseMock = {
      currentDay: 1,
      currentPhase: 'night',
    };

    // Initialize FortuneManager
    fortuneManager = new FortuneManager(playersMock, phaseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('receiveFortuneTarget', () => {
    it('正しい条件下でフォーチュンターゲットが記録されること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      // Setup players
      playersMock.players.set(playerId, { status: 'alive', role: 'seer' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      fortuneManager.receiveFortuneTarget(playerId, targetId);

      expect(fortuneManager.fortuneResult.get(phaseMock.currentDay)).toEqual({
        playerId: targetId,
        team: 'unknown',
      });
    });

    it('フェーズが夜でない場合、エラーがスローされること', () => {
      phaseMock.currentPhase = 'day';
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'seer' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    it('フォーチュンセーターが生存していない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'dead', role: 'seer' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    it('フォーチュンセーターの役割がseerでない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'villager' });
      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    it('ターゲットが生存していない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'seer' });
      playersMock.players.set(targetId, { status: 'dead', role: 'villager' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    it('ターゲットがseerの場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'player2';

      playersMock.players.set(playerId, { status: 'alive', role: 'seer' });
      playersMock.players.set(targetId, { status: 'alive', role: 'seer' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    // エッジケース：攻撃者が存在しない場合
    it('攻撃者が存在しない場合、エラーがスローされること', () => {
      const playerId = 'invalidPlayer';
      const targetId = 'player2';

      playersMock.players.set(targetId, { status: 'alive', role: 'villager' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });

    // エッジケース：ターゲットが存在しない場合
    it('ターゲットが存在しない場合、エラーがスローされること', () => {
      const playerId = 'player1';
      const targetId = 'invalidTarget';

      playersMock.players.set(playerId, { status: 'alive', role: 'seer' });

      expect(() => {
        fortuneManager.receiveFortuneTarget(playerId, targetId);
      }).toThrow(errors.INVALID_FORTUNE);
    });
  });

  describe('fortune', () => {
    it('フォーチュンセーターが生存しており、攻撃履歴が存在する場合、チームが正しく設定されること', () => {
      const currentDay = phaseMock.currentDay;
      const targetId = 'player2';

      // Setup seer
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'player1', status: 'alive', role: 'seer' });

      // Setup fortune result
      fortuneManager.fortuneResult.set(currentDay, { playerId: targetId, team: 'unknown' });

      // Setup target player
      playersMock.players.set(targetId, { _id: targetId, status: 'alive', role: 'villager' });

      fortuneManager.fortune();

      expect(fortuneManager.fortuneResult.get(currentDay)).toEqual({
        playerId: targetId,
        team: 'villagers',
      });
    });

    it('フォーチュンセーターが生存しており、攻撃履歴が存在しない場合、ランダムにターゲットが選ばれチームが設定されること', () => {
      const currentDay = phaseMock.currentDay;
      const randomTargetId = 'player3';
      const randomTarget = { _id: randomTargetId, status: 'alive', role: 'werewolf' };
    
      // Setup seer
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'player1', status: 'alive', role: 'seer' });
    
      // Mock lodash.sample to return specific player
      _.sample.mockReturnValue(randomTarget);
    
      // Mock getFilteredPlayers to include the random target
      playersMock.getFilteredPlayers.mockReturnValue([randomTarget]);
    
      // Setup target player
      playersMock.players.set(randomTargetId, randomTarget);
    
      // Execute the fortune method
      fortuneManager.fortune();
    
      // Assertions
      expect(_.sample).toHaveBeenCalledWith([randomTarget]);
      expect(fortuneManager.fortuneResult.get(currentDay)).toEqual({
        playerId: randomTargetId,
        team: 'werewolves',
      });
    });

    it('フォーチュンセーターが生存していない場合、fortuneメソッドは何も行わないこと', () => {
      // Setup seer
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'player1', status: 'dead', role: 'seer' });

      // Setup fortune result
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'unknown' });

      fortuneManager.fortune();

      expect(fortuneManager.fortuneResult.get(1)).toEqual({ playerId: 'player2', team: 'unknown' });
    });

    it('フォーチュンセーターが存在しない場合、fortuneメソッドは何も行わないこと', () => {
      // Setup seer
      playersMock.findPlayerByRole.mockReturnValue(null);

      // Setup fortune result
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'unknown' });

      fortuneManager.fortune();

      expect(fortuneManager.fortuneResult.get(1)).toEqual({ playerId: 'player2', team: 'unknown' });
    });

    it('getRandomFortuneTargetがエラーをスローする場合、fortuneメソッドもエラーをスローすること', () => {
      // Setup seer
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'player1', status: 'alive', role: 'seer' });

      // Mock getRandomFortuneTarget to throw error
      fortuneManager.getRandomFortuneTarget = jest.fn().mockImplementation(() => {
        throw new Error('Random target selection failed');
      });

      expect(() => {
        fortuneManager.fortune();
      }).toThrow('Random target selection failed');
    });
  });

  describe('getRandomFortuneTarget', () => {
    it('生存中の非seerターゲットからランダムに選び、攻撃履歴に記録すること', () => {
      const currentDay = phaseMock.currentDay;
      const randomTarget = { _id: 'player2', status: 'alive', role: 'villager' };

      // Mock getFilteredPlayers
      playersMock.getFilteredPlayers.mockReturnValue([randomTarget]);

      // Mock lodash.sample to return specific player
      _.sample.mockReturnValue(randomTarget);

      const result = fortuneManager.getRandomFortuneTarget();

      expect(playersMock.getFilteredPlayers).toHaveBeenCalledWith(expect.any(Function));
      expect(_.sample).toHaveBeenCalledWith([randomTarget]);
      expect(fortuneManager.fortuneResult.get(currentDay)).toEqual({
        playerId: 'player2',
        team: 'unknown',
      });
      expect(result).toEqual({
        playerId: 'player2',
        team: 'unknown',
      });
    });

    it('有効な攻撃ターゲットが存在しない場合、エラーがスローされること', () => {
      const currentDay = phaseMock.currentDay;

      // Mock getFilteredPlayers to return empty array
      playersMock.getFilteredPlayers.mockReturnValue([]);

      // Mock lodash.sample to return undefined
      _.sample.mockReturnValue(undefined);

      expect(() => {
        fortuneManager.getRandomFortuneTarget();
      }).toThrow();
    });
  });

  describe('getFortuneResult', () => {
    it('プレイヤーがseerであり、フェーズが「night」の場合、currentDayの攻撃を除外して過去の攻撃履歴を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'seer', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });
      fortuneManager.fortuneResult.set(2, { playerId: 'player3', team: 'werewolves' });
      fortuneManager.fortuneResult.set(3, { playerId: 'player4', team: 'unknown' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
      });
    });

    it('プレイヤーがseerであり、フェーズが「finished」の場合、currentDayの攻撃も含めてすべての攻撃履歴を返すこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'seer', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });
      fortuneManager.fortuneResult.set(2, { playerId: 'player3', team: 'werewolves' });
      fortuneManager.fortuneResult.set(3, { playerId: 'player4', team: 'unknown' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
        3: { playerId: 'player4', team: 'unknown' },
      });
    });

    it('フォーチュンセーターが人狼であり、フェーズが「night」の場合、攻撃履歴が返されないこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'villager', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toBeNull();
    });

    it('現在のフェーズが「pre」の場合、攻撃履歴が返されないこと', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'seer', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'pre';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toBeNull();
    });

    it('プレイヤーが存在しない場合、攻撃履歴が返されないこと', () => {
      const playerId = 'invalidPlayer';

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toBeNull();
    });

    // エッジケース

    it('attackHistoryにcurrentDay以外の日も存在し、フェーズが「finished」の場合、すべての日の攻撃が返されること', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'seer', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });
      fortuneManager.fortuneResult.set(2, { playerId: 'player3', team: 'werewolves' });
      fortuneManager.fortuneResult.set(3, { playerId: 'player4', team: 'unknown' });
      fortuneManager.fortuneResult.set(4, { playerId: 'player5', team: 'unknown' });

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
        3: { playerId: 'player4', team: 'unknown' },
        4: { playerId: 'player5', team: 'unknown' },
      });
    });

    it('attackHistoryにcurrentDayの攻撃が存在しない場合、過去の攻撃のみが返されること', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { role: 'seer', status: 'alive' });

      // Setup fortune history
      fortuneManager.fortuneResult.set(1, { playerId: 'player2', team: 'villagers' });
      fortuneManager.fortuneResult.set(2, { playerId: 'player3', team: 'werewolves' });
      // No attack on currentDay (3)

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = fortuneManager.getFortuneResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
      });
    });
  });
});
