class GuardManager {
  constructor() {
    this.guardHistory = new Map();
  }

  receiveGuardTarget(userId, targetId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const hunter = players.find((pl) => pl._id === userId);
    const target = players.find((pl) => pl._id === targetId);

    if (
      currentPhase !== "night" ||
      hunter?.status !== "alive" || hunter.role !== "hunter"
    ) return;

    if (target?.status !== "alive" || target.role === "hunter") return;

    this.guardHistory.set(currentDay, {
      playerId: targetId,
    });
  }

  guard(attackTargetId, players, phase) {
    const { currentDay } = phase;
    const hunter = players.find((pl) => pl.role === "hunter");
    const guardHistory = this.guardHistory.get(currentDay) ||
      this.getRandomGuardTarget(players, currentDay);

    if (hunter?.status !== "alive") return;

    return attackTargetId === guardHistory.playerId;
  }

  getRandomGuardTarget (players, currentDay) {
    const randomGuardTargets = players.filter(
      (pl) => pl.status === "alive" && pl.role !== "hunter"
    );
    const index = Math.floor(Math.random() * randomGuardTargets.length);
    const randomGuardTarget = randomGuardTargets[index];

    this.guardHistory.set(currentDay, { playerId: randomGuardTarget._id });

    return { playerId: randomGuardTarget._id };
  }

  getGuardHistory(userId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const hunter = players.find((pl) => pl._id === userId);

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