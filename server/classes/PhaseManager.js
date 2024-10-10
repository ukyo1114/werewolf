class PhaseManager {
  static phaseDurations = {
    pre     : 30,
    day     : 10 * 60,
    night   : 3 * 60,
    finished: 10 * 60,
  };

  constructor(eventEmitter) {
    this.currentDay   = 0;
    this.currentPhase = "pre";
    this.changedAt    = new Date();
    this.eventEmitter = eventEmitter;
    this.registerListeners();
    this.startTimer();
  }

  registerListeners() {
    this.eventEmitter.on("processCompleted", (result) => {
      this.nextPhase(result);
      this.eventEmitter.emit("phaseSwitched");
      this.startTimer();
    });
  }

  startTimer() {
    const timer = PhaseManager.phaseDurations[this.currentPhase];

    setTimeout(() => {
      this.eventEmitter.emit("timerEnd");
    }, timer * 1000);
  }
  
  nextPhase(result) {
    this.changedAt = new Date();

    if (result !== "running") return this.currentPhase = "finished";

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