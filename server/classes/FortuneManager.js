const _ = require("lodash");
const { errors } = require("../messages");
const CustomError = require("./CustomError");

class FortuneManager {
  constructor(players, phase) {
    this.fortuneResult = new Map();
    this.players = players;
    this.phase = phase;
  }

  receiveFortuneTarget(playerId, targetId) {
    const { currentDay, currentPhase } = this.phase;
    const seer = this.players.players.get(playerId);
    const target = this.players.players.get(targetId);

    if (
      currentPhase !== "night" ||
      seer?.status !== "alive" || seer.role !== "seer" ||
      target?.status !== "alive" || target.role === "seer"
    ) throw new Error(errors.INVALID_FORTUNE);

    this.fortuneResult.set(currentDay, {
      playerId: targetId,
      team: "unknown",
    });
  }

  fortune() {
    const { currentDay } = this.phase;
    const seer = this.players.findPlayerByRole("seer");
    if (seer?.status !== "alive") return;
    const fortuneResult = this.fortuneResult.get(currentDay) ||
      this.getRandomFortuneTarget();

    const target = this.players.players.get(fortuneResult.playerId);

    fortuneResult.team =
      target.role !== "werewolf" ? "villagers" : "werewolves";
  }

  getRandomFortuneTarget () {
    const { currentDay } = this.phase;
    const fortuneTargets = this.players.getFilteredPlayers((pl) =>
      pl.status === "alive" && pl.role !== "seer"
    );
    const randomFortuneTarget = _.sample(fortuneTargets);
    const fortuneResult = {
      playerId: randomFortuneTarget._id,
      team: "unknown",
    }

    this.fortuneResult.set(currentDay, fortuneResult);
    return this.fortuneResult.get(currentDay);
  }

  getFortuneResult(playerId) {
    const { currentDay, currentPhase } = this.phase;
    const player = this.players.players.get(playerId);

    if (player?.role !== "seer" || currentPhase === "pre") {
      throw new CustomError(403, errors.FORTUNE_RESULT_NOT_FOUND);
    }

    const fortuneResult = {};

    this.fortuneResult.forEach((value, day) => {
      if (day !== currentDay || currentPhase === "finished") {
        fortuneResult[day] = value;
      }
    });
    
    return fortuneResult;
  }
}

module.exports = FortuneManager;