const { errors } = require("../messages");
const CustomError = require("./CustomError");

class MediumManager {
  constructor(players, phase) {
    this.mediumResult = new Map();
    this.players = players;
    this.phase = phase;
  }

  medium(targetId) {
    const { currentDay } = this.phase;
    const medium = this.players.findPlayerByRole("medium");
    if (medium?.status !== "alive") return;

    const target = this.players.players.get(targetId);
    this.mediumResult.set(currentDay, {
      playerId: target._id,
      team: target.role !== "werewolf" ? "villagers" : "werewolves",
    });
  }

  getMediumResult(playerId) {
    const { currentDay, currentPhase } = this.phase;
    const player = this.players.players.get(playerId);

    if (player?.role !== "medium" || currentPhase === "pre") {
      throw new CustomError(403, errors.MEDIUM_RESULT_NOT_FOUND);
    }
    
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