class VoteManager {
  constructor() {
    this.votes = new Map();
  }

  receiveVote(vote, players, phase) {
    const { voter, votee } = vote;
    const { currentDay, currentPhase } = phase;
    const player = players.find((pl) => pl._id === voter);

    if (player?.status !== "alive" || currentPhase !== "day") return;

    if (!this.votes.has(currentDay)) this.votes.set(currentDay, new Map());
    this.votes.get(currentDay).set(voter, votee);
  }

  voteCounter(phase) {
    const { currentDay } = phase;
    
    const votesForDay = this.votes.get(currentDay);
    if (!votesForDay) return null;

    const voteCount = new Map();

    votesForDay.forEach((votee) => {
      voteCount.set(votee, (voteCount.get(votee) || 0) + 1);
    });

    return voteCount;
  }

  getVoteHistory(phase) {
    const { currentDay, currentPhase } = phase;

    if (currentPhase === "pre") return null;

    const voteHistory = {};

    this.votes.forEach((value, day) => {
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