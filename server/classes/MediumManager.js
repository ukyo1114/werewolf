class MediumManager {
  constructor() {
    this.mediumResult = new Map();
  }

  medium(medium, target, currentDay) {
    if(medium.status === "dead") return;

    this.mediumResult.set(currentDay, {
      playerId: target._id,
      team: target.role !== "werewolf" ? "villagers" : "werewolves",
    });
  }

  getMediumResult(player, currentDay, currentPhase) {
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