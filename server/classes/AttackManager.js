const _ = require("lodash");
const { errors } = require("../messages");
const CustomError = require("./CustomError");

class AttackManager {
  constructor(players, phase, guard) {
    this.attackHistory = new Map();
    this.players = players;
    this.phase = phase;
    this.guard = guard;
  }

  receiveAttackTarget(playerId, targetId) {
    const { currentDay, currentPhase } = this.phase;
    const werewolf = this.players.players.get(playerId);
    const target = this.players.players.get(targetId);

    if (
      currentPhase !== "night" ||
      werewolf?.status !== "alive" || werewolf.role !== "werewolf" ||
      target?.status !== "alive" || target.role === "werewolf"
    ) throw new Error(errors.INVALID_ATTACK);

    this.attackHistory.set(currentDay, { playerId: targetId });
  }

  attack() {
    const { currentDay } = this.phase;
    const attackTargetId = this.attackHistory.get(currentDay)?.playerId ||
      this.getRandomAttackTarget();
    const result = this.guard.guard(attackTargetId);

    if (!result) {
      this.players.kill(attackTargetId);
      return this.players.players.get(attackTargetId);
    }
    return null;
  }

  getRandomAttackTarget() {
    const { currentDay } = this.phase;
    const attackTargets = this.players.getFilteredPlayers((pl) => 
      pl.status === "alive" && pl.role !== "werewolf"
    );
    const randomAttackTarget = _.sample(attackTargets);
    this.attackHistory.set(currentDay, { playerId: randomAttackTarget._id });

    return randomAttackTarget._id;
  }

  getAttackHistory(playerId) {
    const { currentDay, currentPhase } = this.phase;
    const werewolf = this.players.players.get(playerId);
    
    if (werewolf?.role !== "werewolf" || currentPhase === "pre") {
      throw new CustomError(403, errors.ATTACK_HISTORY_NOT_FOUND)
    };

    const attackHistory = {};

    this.attackHistory.forEach((value, day) => {
      if (day !== currentDay || currentPhase === "finished") {
        attackHistory[day] = value;
      }
    });
    
    return attackHistory;
  }
}

module.exports = AttackManager;