class MediumManager {
  constructor(players, phase) {
    this.mediumResult = new Map();
    this.players = players;
    this.phase = phase;
  }

  medium(targetId) {
    const { currentDay } = this.phase;
    const medium = this.players.findPlayerByRole("medium");
    const target = this.players.players.get(targetId);
    
    if (medium?.status !== "alive") return;

    this.mediumResult.set(currentDay, {
      playerId: target._id,
      team: target.role !== "werewolf" ? "villagers" : "werewolves",
    });
  }

  getMediumResult(playerId) {
    const { currentDay, currentPhase } = this.phase;
    const medium = this.players.players.get(playerId);

    if (medium?.role !== "medium" || currentPhase === "pre") return null;
    
    const mediumResult = {};

    this.mediumResult.forEach((value, day) => {
      if (day !== currentDay || currentPhase === "finished") {
        mediumResult[day] = value;
      }
    });
    
    return mediumResult;
  }
}

module.exports = MediumManager;

// テスト済み