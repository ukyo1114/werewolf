class VoteManager {
  constructor() {
    this.voteHistory = new Map();
  }

  receiveVote(vote, players, phase) {
    const { voter, votee } = vote;
    const { currentDay, currentPhase } = phase;
    const player = players.find((pl) => pl._id === voter);

    if (player?.status !== "alive" || currentPhase !== "day") return;

    if (!this.voteHistory.has(currentDay)) {
      this.voteHistory.set(currentDay, new Map());
    }
    this.voteHistory.get(currentDay).set(voter, votee);
  }

  voteCounter(phase) {
    const { currentDay } = phase;
    
    const votesForDay = this.voteHistory.get(currentDay);
    if (!votesForDay) return null;

    const voteCount = new Map();

    votesForDay.forEach((votee) => {
      voteCount.set(votee, (voteCount.get(votee) || 0) + 1);
    });

    return voteCount;
  }

  getExecutionTarget(players, phase) {
    const voteCount = this.voteCounter(phase);

    if (!voteCount) return null;

    let executionTargets = [];
    let maxVotes = 0;

    voteCount.forEach((count, votee) => {
      if (count > maxVotes) {
        executionTargets = [votee];
        maxVotes = count;
      }
      if (count === maxVotes) {
        executionTargets.push(votee);
      }
    });

    const index = Math.floor(Math.random() * executionTargets.length);

    return players.find((pl) => pl._id === executionTargets[index]);
  }

  getVoteHistory(phase) {
    const { currentDay, currentPhase } = phase;

    if (currentPhase === "pre") return null;

    const voteHistory = {};

    this.voteHistory.forEach((value, day) => {
      if (day === currentDay && currentPhase === "day") return;
      if (!voteHistory[day]) voteHistory[day] = {};

      value.forEach((votee, voter) => {
        if (!voteHistory[day][votee]) voteHistory[day][votee] = [];
        voteHistory[day][votee].push(voter);
      });
    });
    return voteHistory;
  }
}

module.exports = VoteManager;