// server/tests/classes/mediumManager.test.js

const MediumManager = require('../../classes/MediumManager');
const _ = require('lodash');
const { errors } = require('../../messages');

jest.mock('lodash');

describe('MediumManager', () => {
  let playersMock;
  let phaseMock;
  let mediumManager;

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

    // Initialize MediumManager
    mediumManager = new MediumManager(playersMock, phaseMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('medium', () => {
    it('フォーチュンセーターが生存しており、ターゲットが「werewolf」でない場合、チームが「villagers」として記録されること', () => {
      const targetId = 'player2';
      const targetPlayer = { _id: targetId, status: 'alive', role: 'villager' };

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'alive', role: 'medium' });
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.get(phaseMock.currentDay)).toEqual({
        playerId: targetId,
        team: 'villagers',
      });
    });

    it('フォーチュンセーターが生存しており、ターゲットが「werewolf」である場合、チームが「werewolves」として記録されること', () => {
      const targetId = 'player3';
      const targetPlayer = { _id: targetId, status: 'alive', role: 'werewolf' };

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'alive', role: 'medium' });
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.get(phaseMock.currentDay)).toEqual({
        playerId: targetId,
        team: 'werewolves',
      });
    });

    it('フェーズが「night」でない場合、フォーチュン結果が記録されないこと', () => {
      phaseMock.currentPhase = 'day';
      const targetId = 'player2';
      const targetPlayer = { _id: targetId, status: 'alive', role: 'villager' };

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'alive', role: 'medium' });
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.has(phaseMock.currentDay)).toBe(false);
    });

    it('フォーチュンセーターが生存していない場合、フォーチュン結果が記録されないこと', () => {
      const targetId = 'player2';
      const targetPlayer = { _id: targetId, status: 'alive', role: 'villager' };

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'dead', role: 'medium' });
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.has(phaseMock.currentDay)).toBe(false);
    });

    it('ターゲットが存在しない場合、フォーチュン結果が記録されないこと', () => {
      const targetId = 'invalidPlayer';

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'alive', role: 'medium' });
      // Note: targetId not set in playersMock.players

      // Execute medium method
      expect(() => {
        mediumManager.medium(targetId);
      }).toThrow(); // Assuming target is undefined, accessing target._id would throw

      // Assertions
      expect(mediumManager.mediumResult.has(phaseMock.currentDay)).toBe(false);
    });

    it('フォーチュンセーターが存在しない場合、フォーチュン結果が記録されないこと', () => {
      const targetId = 'player2';
      const targetPlayer = { _id: targetId, status: 'alive', role: 'villager' };

      // Setup medium to return null
      playersMock.findPlayerByRole.mockReturnValue(null);
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.has(phaseMock.currentDay)).toBe(false);
    });

    it('ターゲットの役割が未定義の場合、フォーチュン結果が「villagers」として記録されること', () => {
      const targetId = 'player4';
      const targetPlayer = { _id: targetId, status: 'alive' }; // role undefined

      // Setup medium
      playersMock.findPlayerByRole.mockReturnValue({ _id: 'medium1', status: 'alive', role: 'medium' });
      playersMock.players.set(targetId, targetPlayer);

      // Execute medium method
      mediumManager.medium(targetId);

      // Assertions
      expect(mediumManager.mediumResult.get(phaseMock.currentDay)).toEqual({
        playerId: targetId,
        team: 'villagers', // Since target.role !== 'werewolf'
      });
    });
  });

  describe('getMediumResult', () => {
    it('プレイヤーがフォーチュンセーターであり、フェーズが「night」の場合、現在の日の結果を除外して過去の結果のみが返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });
      mediumManager.mediumResult.set(2, { playerId: 'player3', team: 'werewolves' });
      mediumManager.mediumResult.set(3, { playerId: 'player4', team: 'villagers' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
      });
    });

    it('プレイヤーがフォーチュンセーターであり、フェーズが「finished」の場合、現在の日の結果も含めてすべての結果が返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });
      mediumManager.mediumResult.set(2, { playerId: 'player3', team: 'werewolves' });
      mediumManager.mediumResult.set(3, { playerId: 'player4', team: 'villagers' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
        3: { playerId: 'player4', team: 'villagers' },
      });
    });

    it('フォーチュンセーターが生存しており、フェーズが「finished」でmediumResultに現在の日の結果のみが存在する場合、現在の日の結果が返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(3, { playerId: 'player4', team: 'villagers' }); // currentDay

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({
        3: { playerId: 'player4', team: 'villagers' },
      });
    });

    it('フォーチュン結果が存在しない場合、空のオブジェクトが返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // mediumResult is empty

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({});
    });

    it('プレイヤーがフォーチュンセーターでない場合、nullが返されること', () => {
      const playerId = 'player1';

      // Setup players
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'villager' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toBeNull();
    });

    it('現在のフェーズが「pre」の場合、nullが返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'pre';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toBeNull();
    });

    it('プレイヤーが存在しない場合、nullが返されること', () => {
      const playerId = 'invalidPlayer';

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });

      // Current day and phase
      phaseMock.currentDay = 1;
      phaseMock.currentPhase = 'night';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toBeNull();
    });

    // エッジケース

    it('mediumResultに現在の日以外の結果も存在し、フェーズが「finished」の場合、すべての結果が返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });
      mediumManager.mediumResult.set(2, { playerId: 'player3', team: 'werewolves' });
      mediumManager.mediumResult.set(3, { playerId: 'player4', team: 'villagers' });
      mediumManager.mediumResult.set(4, { playerId: 'player5', team: 'werewolves' });

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'finished';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
        3: { playerId: 'player4', team: 'villagers' },
        4: { playerId: 'player5', team: 'werewolves' },
      });
    });

    it('mediumResultに現在の日の結果が存在しない場合、過去の結果のみが返されること', () => {
      const playerId = 'medium1';

      // Setup medium
      playersMock.players.set(playerId, { _id: playerId, status: 'alive', role: 'medium' });

      // Setup mediumResult
      mediumManager.mediumResult.set(1, { playerId: 'player2', team: 'villagers' });
      mediumManager.mediumResult.set(2, { playerId: 'player3', team: 'werewolves' });
      // No mediumResult for currentDay (3)

      // Current day and phase
      phaseMock.currentDay = 3;
      phaseMock.currentPhase = 'night';

      const history = mediumManager.getMediumResult(playerId);

      expect(history).toEqual({
        1: { playerId: 'player2', team: 'villagers' },
        2: { playerId: 'player3', team: 'werewolves' },
      });
    });
  });
});
