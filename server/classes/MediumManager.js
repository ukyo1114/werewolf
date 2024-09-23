class MediumManager {
  constructor() {
    this.mediumResult = new Map();
  }

  medium(targetId, players, phase) {
    const { currentDay } = phase;
    const medium = players.find((pl) => pl.role === "medium");
    const target = players.find((pl) => pl._id === targetId);

    if(medium.status === "dead") return;

    this.mediumResult.set(currentDay, {
      playerId: targetId,
      team: target.role !== "werewolf" ? "villagers" : "werewolves",
    });
  }

  getMediumResult(userId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const player = players.find((pl) => pl._id === userId);

    if (player.role !== "medium" || currentPhase === "pre") return null;
    
    const mediumResult = {};
    this.mediumResult.forEach((value, day) => {
      if (day !== currentDay) {
        mediumResult[day] = value;
      }
    });
    return mediumResult;
  }
}

module.exports = MediumManager;