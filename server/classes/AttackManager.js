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

  attack(players, phase, guard) {
    const { currentDay } = phase;
    const attackHistory = this.attackHistory.get(currentDay) ||
      this.getRandomAttackTarget(players, currentDay);
    const target = players.find((pl) => pl._id === attackHistory.playerId);
    const result = guard.guard(target._id, players, phase);

    if (!result) target.status = "dead";
  }

  getRandomAttackTarget(players, currentDay) {
    const randomAttackTargets = players.filter(
      (pl) => pl.status === "alive" && pl.role !== "werewolf"
    );
    const index = Math.floor(Math.random() * randomAttackTargets.length);
    const randomAttackTarget = randomAttackTargets[index];

    this.attackHistory.set(currentDay, { playerId: randomAttackTarget._id });

    return { playerId: randomAttackTarget._id };
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