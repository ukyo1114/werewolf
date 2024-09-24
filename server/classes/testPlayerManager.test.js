const PlayerManager = require('./PlayerManager');

describe('PlayerManager', () => {
  let playerManager;

  beforeEach(() => {
    const users = [
      { _id: 'player1' },
      { _id: 'player2' },
      { _id: 'player3' },
      { _id: 'player4' },
      { _id: 'player5' },
      { _id: 'player6' },
      { _id: 'player7' },
      { _id: 'player8' },
      { _id: 'player9' },
      { _id: 'player10' },
    ];
    playerManager = new PlayerManager(users);
  });

  test('should return player state for non-werewolf player', () => {
    // 非人狼のプレイヤーの状態を取得する
    const player = playerManager.players.find(pl => pl.role !== 'werewolf');
    const result = playerManager.getPlayerState(player._id);

    // プレイヤーの状態が返され、パートナーIDが存在しないことを確認
    expect(result).toHaveProperty('_id', player._id);
    expect(result).toHaveProperty('role', player.role);
    expect(result.partnerId).toBeUndefined();
  });

  test('should return player state and set partnerId for werewolf player', () => {
    // 人狼のプレイヤーの状態を取得する
    const werewolf = playerManager.players.find(pl => pl.role === 'werewolf');
    const result = playerManager.getPlayerState(werewolf._id);

    // パートナーの人狼が正しく設定されていることを確認
    expect(result).toHaveProperty('_id', werewolf._id);
    expect(result).toHaveProperty('role', 'werewolf');
    expect(result.partnerId).toBeDefined(); // パートナーIDが存在するか確認

    const partner = playerManager.players.find(
      pl => pl._id !== werewolf._id && pl.role === 'werewolf'
    );
    expect(result.partnerId).toBe(partner._id); // パートナーが正しく設定されているか確認
  });
});
