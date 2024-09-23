const VoteManager = require('./VoteManager'); // VoteManagerのパスに応じて変更

describe('VoteManager', () => {
  let voteManager;
  let players;
  let phase;

  beforeEach(() => {
    voteManager = new VoteManager();
    
    // プレイヤーリストの作成
    players = [
      { _id: 'player1', status: 'alive' },
      { _id: 'player2', status: 'alive' },
      { _id: 'player3', status: 'alive' },
      { _id: 'player4', status: 'dead' }
    ];

    // 初期フェーズ（昼）
    phase = {
      currentDay: 1,
      currentPhase: 'day',
    };
  });

  test('should receive vote and store it correctly', () => {
    const vote = { voter: 'player1', votee: 'player2' };

    // 投票を受け取る
    voteManager.receiveVote(vote, players, phase);

    // 投票が正しく保存されているか確認
    expect(voteManager.votes.get(1).get('player1')).toBe('player2');
  });

  test('should count votes correctly', () => {
    // 複数の投票を受け付ける
    voteManager.receiveVote({ voter: 'player1', votee: 'player2' }, players, phase);
    voteManager.receiveVote({ voter: 'player3', votee: 'player2' }, players, phase);

    // 票数をカウント
    const voteCount = voteManager.voteCounter(phase);

    // player2 に2票入っていることを確認
    expect(voteCount.get('player2')).toBe(2);
  });

  test('should not return current day votes during day phase', () => {
    // Day 1 の投票データを設定
    voteManager.receiveVote({ voter: 'player1', votee: 'player2' }, players, phase);
    
    // Day 2 に進行し、Day 2 の昼に投票を行う
    phase.currentDay = 2;
    phase.currentPhase = 'day';  // 現在のフェーズは昼
    voteManager.receiveVote({ voter: 'player3', votee: 'player1' }, players, phase);
  
    // Day 2 (当日昼) の履歴を取得
    const voteHistory = voteManager.getVoteHistory(phase);
  
    // Day 1 の履歴に player1 が player2 に投票した記録があるか確認
    expect(voteHistory[1]['player2']).toEqual(['player1']);
    
    // Day 2 の投票は履歴に含まれていないことを確認
    expect(voteHistory[2]).toBeUndefined();
  });
  

  test('should not receive vote if it is not daytime', () => {
    const vote = { voter: 'player1', votee: 'player2' };

    // フェーズを夜に変更
    phase.currentPhase = 'night';

    // 夜の投票は無効になるか確認
    voteManager.receiveVote(vote, players, phase);

    // 投票は保存されていないことを確認
    expect(voteManager.votes.get(1)).toBeUndefined();
  });
});
