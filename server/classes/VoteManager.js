class VoteManager {
  constructor() {
    this.votes = new Map();
  }

  receiveVote(vote, currentDay) {
    const { voter, votee } = vote;

    if (!this.votes.has(currentDay)) this.votes.set(currentDay, new Map());
    this.votes.get(currentDay).set(voter, votee);
  }

  voteCounter(currentDay) {
    if (!this.votes.get(currentDay)) return null;
    const voteCount = new Map();

    this.votes.get(currentDay).forEach((votee) => {
      if (!voteCount.has(votee)) voteCount.set(votee, 0);
      voteCount.set(votee, voteCount.get(votee) + 1);
    });

    return voteCount;
  }
}

module.exports = VoteManager;