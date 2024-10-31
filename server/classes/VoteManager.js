const _ = require("lodash");
const { errors } = require("../messages");

class VoteManager {
  constructor(players, phase) {
    this.voteHistory = new Map();
    this.players = players;
    this.phase = phase;
  }

  receiveVote(playerId, targetId) {
    const { currentDay, currentPhase } = this.phase;
    const player = this.players.players.get(playerId);
    const target = this.players.players.get(targetId);

    if (
      player?.status !== "alive" ||
      target?.status !== "alive" ||
      currentPhase !== "day"
    ) {
      throw new Error(errors.INVALID_VOTE);
    };

    if (!this.voteHistory.has(currentDay)) {
      this.voteHistory.set(currentDay, new Map());
    }

    this.voteHistory.get(currentDay).set(playerId, targetId);
  }

  voteCounter() {
    const { currentDay } = this.phase;
    const votesForDay = this.voteHistory.get(currentDay);
    if (!votesForDay) return null;

    const voteeArray = Array.from(votesForDay.values());
    return _.countBy(voteeArray);
  }

  getExecutionTarget() {
    const voteCount = this.voteCounter();
    if (!voteCount) return null;

    const maxVotes = _.max(Object.values(voteCount));
    const executionTargets = Object.entries(voteCount)
      .filter(([_, count]) => count === maxVotes)
      .map(([votee]) => votee);

    return _.sample(executionTargets);
  }

  getVoteHistory() {
    const { currentDay, currentPhase } = this.phase;
    if (currentPhase === "pre") return null;
    const voteHistory = {};

    this.voteHistory.forEach((votes, day) => {
      if (day === currentDay && currentPhase === "day") return;
  
      const dayVotes = {};
      votes.forEach((votee, voter) => {
        if (!dayVotes[votee]) {
          dayVotes[votee] = [];
        }
        dayVotes[votee].push(voter);
      });
  
      voteHistory[day] = dayVotes;
    });
  
    return voteHistory;
  }
}

module.exports = VoteManager;

// テスト済み