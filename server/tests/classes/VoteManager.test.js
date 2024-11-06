const VoteManager = require('../../classes/VoteManager');
const { errors } = require('../../messages');

describe('VoteManagerクラスのテスト', () => {
  let players;
  let phase;
  let voteManager;

  beforeEach(() => {
    players = {
      players: new Map([
        ['user1', { _id: 'user1', status: 'alive', name: 'Alice' }],
        ['user2', { _id: 'user2', status: 'alive', name: 'Bob' }],
        ['user3', { _id: 'user3', status: 'alive', name: 'Charlie' }],
        ['user4', { _id: 'user4', status: 'alive', name: 'Diana' }],
      ]),
    };

    phase = {
      currentDay: 1,
      currentPhase: 'day',
    };

    voteManager = new VoteManager(players, phase);
  });

  // 1. constructorのテスト
  describe('constructor', () => {
    it('インスタンスが正しく初期化されること', () => {
      expect(voteManager).toBeInstanceOf(VoteManager);
      expect(voteManager.voteHistory).toBeInstanceOf(Map);
      expect(voteManager.players).toEqual(players);
      expect(voteManager.phase).toEqual(phase);
    });
  });

  // 2. receiveVoteメソッドのテスト
  describe('receiveVote', () => {
    it('生存しているプレイヤーが生存している他のプレイヤーに投票できること', () => {
      voteManager.receiveVote('user1', 'user2');

      const votesForDay = voteManager.voteHistory.get(phase.currentDay);
      expect(votesForDay.get('user1')).toBe('user2');
    });

    it('同じプレイヤーが複数回投票した場合、最新の投票が記録されること', () => {
      voteManager.receiveVote('user1', 'user2');
      voteManager.receiveVote('user1', 'user3');

      const votesForDay = voteManager.voteHistory.get(phase.currentDay);
      expect(votesForDay.get('user1')).toBe('user3');
    });

    it('死亡しているプレイヤーが投票しようとした場合、エラーを投げること', () => {
      players.players.get('user1').status = 'dead';

      expect(() => {
        voteManager.receiveVote('user1', 'user2');
      }).toThrowError(errors.INVALID_VOTE);
    });

    it('死亡しているプレイヤーに投票しようとした場合、エラーを投げること', () => {
      players.players.get('user2').status = 'dead';

      expect(() => {
        voteManager.receiveVote('user1', 'user2');
      }).toThrowError(errors.INVALID_VOTE);
    });

    it('現在のフェーズが "day" 以外の場合、エラーを投げること', () => {
      phase.currentPhase = 'night';

      expect(() => {
        voteManager.receiveVote('user1', 'user2');
      }).toThrowError(errors.INVALID_VOTE);
    });
  });

  // 3. voteCounterメソッドのテスト
  describe('voteCounter', () => {
    it('現在の投票結果が正しくカウントされること', () => {
      voteManager.receiveVote('user1', 'user2');
      voteManager.receiveVote('user3', 'user2');
      voteManager.receiveVote('user4', 'user3');

      const voteCount = voteManager.voteCounter();
      expect(voteCount).toEqual({
        'user2': 2,
        'user3': 1,
      });
    });

    it('投票がまだ行われていない場合、nullを返すこと', () => {
      const voteCount = voteManager.voteCounter();
      expect(voteCount).toBeNull();
    });
  });

  // 4. getExecutionTargetメソッドのテスト
  describe('getExecutionTarget', () => {
    it('最多得票者が正しく取得されること', () => {
      voteManager.receiveVote('user1', 'user2');
      voteManager.receiveVote('user3', 'user2');
      voteManager.receiveVote('user4', 'user3');

      const executionTarget = voteManager.getExecutionTarget();
      expect(executionTarget._id).toBe('user2');
    });

    it('同票の場合、ランダムに対象が選ばれること', () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0);

      voteManager.receiveVote('user1', 'user2');
      voteManager.receiveVote('user3', 'user3');

      const executionTarget = voteManager.getExecutionTarget();
      expect(['user2', 'user3']).toContain(executionTarget._id);

      global.Math.random.mockRestore();
    });

    it('投票がまだ行われていない場合、nullを返すこと', () => {
      const executionTarget = voteManager.getExecutionTarget();
      expect(executionTarget).toBeNull();
    });
  });

  // 5. getVoteHistoryメソッドのテスト
  describe('getVoteHistory', () => {
    beforeEach(() => {
      // Day 1 votes
      voteManager.receiveVote('user1', 'user2');
      voteManager.receiveVote('user3', 'user2');
      voteManager.receiveVote('user4', 'user3');

      // Advance to night phase
      phase.currentPhase = 'night';

      // Day 2 votes
      phase.currentDay = 2;
      phase.currentPhase = 'day';
      voteManager.receiveVote('user1', 'user3');
      voteManager.receiveVote('user3', 'user4');
      voteManager.receiveVote('user4', 'user1');
    });

    it('過去の投票履歴が正しく取得されること', () => {
      phase.currentPhase = 'night';
      const voteHistory = voteManager.getVoteHistory();

      expect(voteHistory).toEqual({
        1: {
          'user2': ['user1', 'user3'],
          'user3': ['user4'],
        },
        2: {
          'user3': ['user1'],
          'user4': ['user3'],
          'user1': ['user4'],
        },
      });
    });

    it('現在のフェーズが "day" の場合、当日の投票履歴は含まれないこと', () => {
      const voteHistory = voteManager.getVoteHistory();

      expect(voteHistory).toEqual({
        1: {
          'user2': ['user1', 'user3'],
          'user3': ['user4'],
        },
      });
    });

    it('フェーズが "pre" の場合、nullを返すこと', () => {
      phase.currentPhase = 'pre';
      const voteHistory = voteManager.getVoteHistory();
      expect(voteHistory).toBeNull();
    });
  });
});
