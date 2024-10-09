const _ = require('lodash');
const { errors } = require("../messages");

class GuardManager {
  constructor(players, phase) {
    this.guardHistory = new Map();
    this.players = players;
    this.phase = phase;
  }

  receiveGuardTarget(playerId, targetId) {
    const { currentDay, currentPhase } = this.phase;
    const hunter = this.players.get(playerId);
    const target = this.players.get(targetId);

    if (
      currentPhase !== "night" ||
      hunter?.status !== "alive" || hunter.role !== "hunter" ||
      target?.status !== "alive" || target.role === "hunter"
    ) throw new Error(errors.INVALID_GUARD);

    this.guardHistory.set(currentDay, { playerId: targetId });
  }

  guard(attackTargetId) {
    const { currentDay } = this.phase;
    const hunter = this.players.findPlayerByRole("hunter");
    if (hunter?.status !== "alive") return;
    const guardTarget = this.guardHistory.get(currentDay)?.playerId ||
      this.getRandomGuardTarget();

    return attackTargetId === guardTarget;
  }

  getRandomGuardTarget () {
    const { currentDay } = this.phase;
    const guardTargets = this.players.getFilteredPlayers((pl) =>
      pl.status === "alive" && pl.role !== "hunter"
    );
    const randomGuardTarget = _.sample(guardTargets);
    this.guardHistory.set(currentDay, { playerId: randomGuardTarget._id });

    return randomGuardTarget._id;
  }

  getGuardHistory(playerId) {
    const { currentDay, currentPhase } = this.phase;
    const hunter = this.players.get(playerId);
    if (hunter?.role !== "hunter" || currentPhase === "pre") return null;

    const guardHistory = {};

    this.guardHistory.forEach((value, day) => {
      if (day !== currentDay || currentPhase === "finished") {
        guardHistory[day] = value;
      }
    });
    
    return guardHistory;
  }
}

module.exports = GuardManager;

// テスト済み