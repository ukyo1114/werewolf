class AttackManager {
  constructor() {
    this.attackHistory = new Map();
  }

  receiveAttackTarget(userId, targetId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const werewolf = players.find((pl) => pl._id === userId);
    const target = players.find((pl) => pl._id === targetId);

    if (
      currentPhase !== "night" ||
      werewolf?.status !== "alive" || werewolf.role !== "werewolf"
    ) return;

    if (target?.status !== "alive" || target.role === "werewolf") return;

    this.attackHistory.set(currentDay, {
      playerId: targetId,
    });
  }

  attack(players, phase, guardManager) {
    const { currentDay } = phase;
    const attackHistory = this.attackHistory.get(currentDay);

    if (!attackHistory) return this.randomAttack(players, phase, guardManager);

    const target = players.find((pl) => pl._id === attackHistory.playerId);
    const result = guardManager.guard(target._id, players, phase);

    if (!result) target.kill();
  }

  randomAttack(players, phase, guardManager) {
    const { currentDay } = phase;
    const randomAttackTarget = getRandomAttackTarget(players);
    const result = guardManager.guard(randomAttackTarget._id, players, phase);

    this.attackHistory.set(currentDay, {
      playerId: randomAttackTarget._id,
    });

    if (!result) randomAttackTarget.kill();
  }

  getRandomAttackTarget (players) {
    const randomAttackTargets = players.filter(
      (pl) => pl.status === "alive" && pl.role !== "werewolf"
    );
    const index = Math.floor(Math.random() * randomAttackTargets.length);
    return randomAttackTargets[index];
  }

  getAttackhistory(userId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const werewolf = players.find((pl) => pl._id === userId);

    if (werewolf?.role !== "werewolf" || currentPhase === "pre") return null;

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