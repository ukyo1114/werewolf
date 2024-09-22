const ERROR_MESSAGES = {
  UNKNOWN_PHASE: "不明なフェーズです",
};

class PhaseManager {
  phaseDurations = {
    pre: 30,
    day: 10 * 60,
    night: 3 * 60,
    finished: 10 * 60,
  };

  constructor(eventEmitter) {
    this.currentDay = 0;
    this.currentPhase = "pre";
    this.changedAt = new Date();
    this.eventEmitter = eventEmitter;
  }

  startTimer() {
    const timer = this.phaseDurations[this.currentPhase];
    if (!timer) return console.error(ERROR_MESSAGES.UNKNOWN_PHASE);

    setTimeout(() => {
      this.switchPhase();
    }, timer * 1000);
  }

  switchPhase() {
    this.eventEmitter.emit(
      this.currentPhase,
      { currentDay: this.currentDay },
      (result) => {
        this.nextPhase(result);
        // this.updateGameState();
        this.startTimer();
      }
    );
  }

  nextPhase(result) {
    this.changedAt = new Date();

    if (result !== "running") {
      this.currentPhase = "finished";
      return;
    }
    if (this.currentPhase === "day") {
      this.currentPhase = "night";
    } else {
      this.currentDay = this.currentDay + 1;
      this.currentPhase = "day";
    }
  }
}

module.exports = PhaseManager;