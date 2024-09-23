const MediumManager = require('./MediumManager');

describe('MediumManager', () => {
  let mediumManager;
  let mediumPlayer;
  let targetPlayer;

  beforeEach(() => {
    mediumManager = new MediumManager();
    
    // 生きている霊媒師
    mediumPlayer = { _id: 'medium1', status: 'alive', role: 'medium' };
    
    // 霊媒対象のプレイヤー
    targetPlayer = { _id: 'player1', role: 'werewolf' };
  });

  test('should set medium result correctly', () => {
    const currentDay = 1;
    
    // 霊媒結果を設定
    mediumManager.medium(mediumPlayer, targetPlayer, currentDay);

    // 結果が正しくセットされたかを確認
    expect(mediumManager.mediumResult.get(currentDay)).toEqual({
      playerId: 'player1',
      team: 'werewolves'
    });
  });

  test('should return medium result without current day', () => {
    const currentDay = 1;

    // 複数の霊媒結果をセット
    mediumManager.medium(mediumPlayer, targetPlayer, currentDay);
    mediumManager.medium(mediumPlayer, { _id: 'player2', role: 'villager' }, 2);

    // currentDayを除いた結果を取得
    const result = mediumManager.getMediumResult(mediumPlayer, currentDay, 'night');

    // currentDayを除外した結果が返されていることを確認
    expect(result).toEqual({
      2: { playerId: 'player2', team: 'villagers' }
    });
  });

  test('should not set medium result if medium is dead', () => {
    const currentDay = 1;
    
    // 死んでいる霊媒師
    const deadMediumPlayer = { _id: 'medium2', status: 'dead', role: 'medium' };
    
    // 霊媒結果を設定しないことを確認
    mediumManager.medium(deadMediumPlayer, targetPlayer, currentDay);

    expect(mediumManager.mediumResult.get(currentDay)).toBeUndefined();
  });

  test('should return null if player is not a medium', () => {
    const currentDay = 1;

    // 霊媒師でないプレイヤー
    const nonMediumPlayer = { _id: 'player3', status: 'alive', role: 'villager' };

    const result = mediumManager.getMediumResult(nonMediumPlayer, currentDay, 'night');

    expect(result).toBeNull();
  });

  test('should return null if current phase is pre', () => {
    const currentDay = 1;

    // プレイヤーが霊媒師でも、フェーズが "pre" の場合は null を返す
    const result = mediumManager.getMediumResult(mediumPlayer, currentDay, 'pre');

    expect(result).toBeNull();
  });
});
