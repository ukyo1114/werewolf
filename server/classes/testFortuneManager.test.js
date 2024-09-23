const FortuneManager = require('./FortuneManager');

describe('FortuneManager - getFortuneResult', () => {
  let fortuneManager;
  let players;
  let phase;

  beforeEach(() => {
    fortuneManager = new FortuneManager();

    players = [
      { _id: 'seer1', status: 'alive', role: 'seer' },
      { _id: 'player1', status: 'alive', role: 'villager' },
      { _id: 'player2', status: 'alive', role: 'werewolf' },
    ];

    phase = {
      currentDay: 1,
      currentPhase: 'night',
    };

    // Day 1の占い結果をセット
    fortuneManager.fortuneResult.set(1, {
      playerId: 'player2',
      team: 'werewolves',
    });

    // Day 2の占い結果をセット
    phase.currentDay = 2;
    fortuneManager.fortuneResult.set(2, {
      playerId: 'player1',
      team: 'villagers',
    });
  });

  test('should return null if player is not a seer', () => {
    // プレイヤーが占い師でない場合
    const result = fortuneManager.getFortuneResult('player1', players, phase);
    expect(result).toBeNull();
  });

  test('should return null if current phase is pre', () => {
    // フェーズが "pre" の場合
    phase.currentPhase = 'pre';
    const result = fortuneManager.getFortuneResult('seer1', players, phase);
    expect(result).toBeNull();
  });

  test('should return all fortune results except current day', () => {
    // Day 2 に進行中のときに結果を取得
    const result = fortuneManager.getFortuneResult('seer1', players, phase);

    // Day 1 のみが結果として返されることを確認
    expect(result).toEqual({
      1: {
        playerId: 'player2',
        team: 'werewolves',
      },
    });
  });

  test('should return results even if phase is finished', () => {
    // フェーズを "finished" に設定
    phase.currentPhase = 'finished';
    const result = fortuneManager.getFortuneResult('seer1', players, phase);

    // Day 1 と Day 2 の結果が含まれていることを確認
    expect(result).toEqual({
      1: {
        playerId: 'player2',
        team: 'werewolves',
      },
      2: {
        playerId: 'player1',
        team: 'villagers',
      },
    });
  });
});
