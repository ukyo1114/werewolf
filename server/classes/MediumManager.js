class MediumManager {
  constructor() {
    this.mediumResult = new Map();
  }

  medium(targetId, players, phase) {
    const { currentDay } = phase;
    const medium = players.find((pl) => pl.role === "medium");
    const target = players.find((pl) => pl._id === targetId);

    if(medium?.status !== "alive") return;

    this.mediumResult.set(currentDay, {
      playerId: targetId,
      team: target.role !== "werewolf" ? "villagers" : "werewolves",
    });
  }

  getMediumResult(userId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const medium = players.find((pl) => pl._id === userId);

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