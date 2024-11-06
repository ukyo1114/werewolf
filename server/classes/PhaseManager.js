class PhaseManager {
  static phaseDurations = {
    pre     : 30, // 30秒に戻す
    day     : 10 * 60, // 10分に戻す
    night   : 3 * 60, // 3分に戻す
    finished: 10 * 60, // 10分に戻す
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
    console.log("nextPhase", this.result.value);
    if (this.result.value !== "running") return this.currentPhase = "finished";

    if (this.currentPhase === "day") {
      this.currentPhase = "night";
    } else {
      this.currentDay = this.currentDay + 1;
      this.currentPhase = "day";
    }
  }
}

module.exports = PhaseManager;