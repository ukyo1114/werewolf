const _ = require('lodash');
const { errors } = require("../messages");

class FortuneManager {
  constructor(players, phase) {
    this.fortuneResult = new Map();
    this.players = players;
    this.phase = phase;
  }

  receiveFortuneTarget(playerId, targetId) {
    const { currentDay, currentPhase } = this.phase;
    const seer = this.players.get(playerId);
    const target = this.players.get(targetId);

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

    const target = this.players.get(fortuneResult.playerId);

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
    const seer = this.players.get(playerId);
    if (seer?.role !== "seer" || currentPhase === "pre") return null;

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

// テスト済み