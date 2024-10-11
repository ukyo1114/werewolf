class PhaseManager {
  static phaseDurations = {
    pre     : 30,
    day     : 10 * 60,
    night   : 3 * 60,
    finished: 10 * 60,
  };

  constructor(eventEmitter, result) {
    this.currentDay   = 0;
    this.currentPhase = "pre";
    this.changedAt    = new Date();
    this.eventEmitter = eventEmitter;
    this.result = result;
    this.registerListeners();
    this.startTimer();
  }

  registerListeners() {
    this.eventEmitter.on("processCompleted", () => {
      this.nextPhase();
      this.eventEmitter.emit("phaseSwitched");
      this.startTimer();
    });
  }

  startTimer() {
    const timer = PhaseManager.phaseDurations[this.currentPhase];
    setTimeout(() => this.eventEmitter.emit("timerEnd"), timer * 1000);
  }
  
  nextPhase() {
    this.changedAt = new Date();
    if (this.result !== "running") return this.currentPhase = "finished";

    if (this.currentPhase === "day") {
      this.currentPhase = "night";
    } else {
      this.currentDay = this.currentDay + 1;
      this.currentPhase = "day";
    }
  }
}

module.exports = PhaseManager;

// テスト済み