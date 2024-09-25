class FortuneManager {
  constructor() {
    this.fortuneResult = new Map();
  }

  receiveFortuneTarget(userId, targetId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const seer = players.find((pl) => pl._id === userId);
    const target = players.find((pl) => pl._id === targetId);

    if (
      currentPhase !== "night" ||
      seer?.status !== "alive" || seer.role !== "seer"
    ) throw new Error(errors.INVALID_FORTUNE);

    if (target?.status !== "alive" || target.role === "seer") {
      throw new Error(errors.INVALID_FORTUNE);
    };

    this.fortuneResult.set(currentDay, {
      playerId: targetId,
      team: "unknown",
    });
  }

  fortune(players, phase) {
    const { currentDay } = phase;
    const seer = players.find((pl) => pl.role === "seer");
    const fortuneResult = this.fortuneResult.get(currentDay) ||
      this.getRandomFortuneTarget(players, currentDay);

    if (seer?.status !== "alive") return;

    const target = players.find((pl) => pl._id === fortuneResult.playerId);

    fortuneResult.team =
      target.role !== "werewolf" ? "villagers" : "werewolves";
  }

  getRandomFortuneTarget (players, currentDay) {
    const randomFortuneTargets = players.filter(
      (pl) => pl.status === "alive" && pl.role !== "seer"
    );
    const index = Math.floor(Math.random() * randomFortuneTargets.length);
    const randomFortuneTarget = randomFortuneTargets[index];

    this.fortuneResult.set(currentDay, {
      playerId: randomFortuneTarget._id,
      team: "unknown",
    });

    return {
      playerId: randomFortuneTarget._id,
      team: "unknown",
    };
  }

  getFortuneResult(userId, players, phase) {
    const { currentDay, currentPhase } = phase;
    const seer = players.find((pl) => pl._id === userId);

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