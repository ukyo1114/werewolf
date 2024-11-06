// tests/PlayerManager.test.js

const PlayerManager = require('../../classes/PlayerManager');

describe('PlayerManagerクラスのテスト', () => {
  let users;
  let playerManager;

  beforeEach(() => {
    users = [
      { _id: 'user1', name: 'Alice' },
      { _id: 'user2', name: 'Bob' },
      { _id: 'user3', name: 'Charlie' },
      { _id: 'user4', name: 'Diana' },
      { _id: 'user5', name: 'Eve' },
      { _id: 'user6', name: 'Frank' },
      { _id: 'user7', name: 'Grace' },
      { _id: 'user8', name: 'Heidi' },
      { _id: 'user9', name: 'Ivan' },
      { _id: 'user10', name: 'Judy' },
    ];

    playerManager = new PlayerManager(users);
  });

  // 1. constructorのテスト
  describe('constructor', () => {
    it('プレイヤーが正しく初期化され、ロールが割り当てられていること', () => {
      expect(playerManager.players.size).toBe(10);
      playerManager.players.forEach((player) => {
        expect(player).toHaveProperty('_id');
        expect(player).toHaveProperty('name');
        expect(player).toHaveProperty('status', 'alive');
        expect(player).toHaveProperty('role');
        expect(player.role).not.toBeNull();
      });
    });
  });

  // 2. setPlayersメソッドのテスト
  describe('setPlayers', () => {
    it('新しいユーザーリストでプレイヤーが正しく設定されること', () => {
      const newUsers = [
        { _id: 'user11', name: 'Kevin' },
        { _id: 'user12', name: 'Laura' },
      ];

      playerManager.setPlayers(newUsers);

      expect(playerManager.players.size).toBe(2);
      expect(playerManager.players.has('user11')).toBe(true);
      expect(playerManager.players.has('user12')).toBe(true);
    });

    it('空のユーザーリストを渡した場合、playersが空になること', () => {
      playerManager.setPlayers([]);

      expect(playerManager.players.size).toBe(0);
    });
  });

  // 3. assignRolesメソッドのテスト
  describe('assignRoles', () => {
    beforeEach(() => {
      playerManager = new PlayerManager(users, false);
    });

    it('指定されたロールがプレイヤーに正しく割り当てられること', () => {
      const roles = ['villager', 'werewolf'];
      playerManager.assignRoles(roles);
    
      const assignedRoles = Array.from(playerManager.players.values()).map((p) => p.role);
      expect(assignedRoles.filter((role) => role === 'villager').length).toBe(1);
      expect(assignedRoles.filter((role) => role === 'werewolf').length).toBe(1);
      expect(assignedRoles.filter((role) => role === null).length).toBe(8);
    });

    it('空のロールリストを渡した場合、全てのプレイヤーのロールがnullになること', () => {
      const roles = [];
      playerManager.assignRoles(roles);
    
      playerManager.players.forEach((player) => {
        expect(player.role).toBeNull();
      });
    });
  });

  // 4. killメソッドのテスト
  describe('kill', () => {
    it('指定したプレイヤーのステータスがdeadになること', () => {
      playerManager.kill('user1');
      const player = playerManager.players.get('user1');
      expect(player.status).toBe('dead');
    });

    it('存在しないプレイヤーIDを渡した場合、何も起こらないこと', () => {
      playerManager.kill('nonexistentUser');
      expect(playerManager.players.size).toBe(10);
    });
  });

  // 5. getPlayerStateメソッドのテスト
  describe('getPlayerState', () => {
    it('存在するプレイヤーの状態が正しく取得されること', () => {
      const state = playerManager.getPlayerState('user1');
      expect(state).toHaveProperty('_id', 'user1');
      expect(state).toHaveProperty('status', 'alive');
      expect(state).toHaveProperty('role');
    });

    it('存在しないプレイヤーIDを渡した場合、spectatorとして扱われること', () => {
      const state = playerManager.getPlayerState('nonexistentUser');
      expect(state).toEqual({ _id: 'nonexistentUser', status: 'spectator', role: '' });
    });

    it('人狼プレイヤーの場合、partnerIdが正しく設定されること', () => {
      // ロールを手動で設定
      playerManager.players.get('user1').role = 'werewolf';
      playerManager.players.get('user2').role = 'werewolf';

      const state = playerManager.getPlayerState('user1');
      expect(state).toHaveProperty('partnerId', 'user2');
    });
  });

  // 6. getPlayerByIdメソッドのテスト
  describe('getPlayerById', () => {
    it('指定したプレイヤーオブジェクトが取得されること', () => {
      const player = playerManager.getPlayerById('user1');
      expect(player).toHaveProperty('_id', 'user1');
    });

    it('存在しないプレイヤーIDを渡した場合、undefinedを返すこと', () => {
      const player = playerManager.getPlayerById('nonexistentUser');
      expect(player).toBeUndefined();
    });
  });

  // 7. getWerewolfPartnerメソッドのテスト
  describe('getWerewolfPartner', () => {
    beforeEach(() => {
      playerManager = new PlayerManager(users, false);
    });

    it('人狼プレイヤーのパートナーIDが取得されること', () => {
      // ロールを手動で設定
      playerManager.players.get('user1').role = 'werewolf';
      playerManager.players.get('user2').role = 'werewolf';

      const partnerId = playerManager.getWerewolfPartner('user1');
      expect(partnerId).toBe('user2');
    });

    it('パートナーが存在しない場合、nullを返すこと', () => {
      playerManager.players.get('user1').role = 'werewolf';

      const partnerId = playerManager.getWerewolfPartner('user1');
      expect(partnerId).toBeNull();
    });
  });

  // 8. getFilteredPlayersメソッドのテスト
  describe('getFilteredPlayers', () => {
    it('指定した条件でプレイヤーがフィルタリングされること', () => {
      const alivePlayers = playerManager.getFilteredPlayers((p) => p.status === 'alive');
      expect(alivePlayers.length).toBe(10);

      playerManager.kill('user1');

      const alivePlayersAfterKill = playerManager.getFilteredPlayers((p) => p.status === 'alive');
      expect(alivePlayersAfterKill.length).toBe(9);
    });
  });

  // 9. findPlayerByRoleメソッドのテスト
  describe('findPlayerByRole', () => {
    it('指定したロールを持つ最初のプレイヤーが取得されること', () => {
      // ロールを手動で設定
      playerManager.players.get('user1').role = 'seer';

      const player = playerManager.findPlayerByRole('seer');
      expect(player).toHaveProperty('_id', 'user1');
    });

    it('該当するロールが存在しない場合、undefinedを返すこと', () => {
      const player = playerManager.findPlayerByRole('nonexistentRole');
      expect(player).toBeUndefined();
    });
  });

  // 10. getLivingPlayersメソッドのテスト
  describe('getLivingPlayers', () => {
    it('生存しているプレイヤーが取得されること', () => {
      const livingPlayers = playerManager.getLivingPlayers();
      expect(livingPlayers.length).toBe(10);

      playerManager.kill('user1');
      playerManager.kill('user2');

      const livingPlayersAfterKill = playerManager.getLivingPlayers();
      expect(livingPlayersAfterKill.length).toBe(8);
    });
  });

  // 11. getPlayersWithoutRoleメソッドのテスト
  describe('getPlayersWithoutRole', () => {
    it('ロール情報を除いたプレイヤーリストが取得されること', () => {
      const playersWithoutRole = playerManager.getPlayersWithoutRole();
      playersWithoutRole.forEach((player) => {
        expect(player).not.toHaveProperty('role');
      });
    });
  });

  // 12. getWerewolvesメソッドのテスト
  describe('getWerewolves', () => {
    beforeEach(() => {
      playerManager = new PlayerManager(users, false);
    });
    
    it('人狼のプレイヤーIDリストが取得されること', () => {
      // ロールを手動で設定
      playerManager.players.get('user1').role = 'werewolf';
      playerManager.players.get('user2').role = 'werewolf';

      const werewolfIds = playerManager.getWerewolves();
      expect(werewolfIds).toContain('user1');
      expect(werewolfIds).toContain('user2');
      expect(werewolfIds.length).toBe(2);
    });

    it('人狼が存在しない場合、空の配列を返すこと', () => {
      playerManager.players.forEach((p) => (p.role = 'villager'));

      const werewolfIds = playerManager.getWerewolves();
      expect(werewolfIds.length).toBe(0);
    });
  });
});
