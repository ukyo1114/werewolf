const PlayerManager  = require("./PlayerManager");
const VoteManager    = require("./VoteManager");
const FortuneManager = require("./FortuneManager");
const AttackManager  = require("./AttackManager");
const GuardManager   = require("./GuardManager");
const MediumManager  = require("./MediumManager");
const PhaseManager   = require("./PhaseManager");
const EventEmitter   = require("events");

const gameEvents = new EventEmitter();
const games = {};

class GameState {
  constructor(game) {
    this.eventEmitter = new EventEmitter();
    this.channelId = game.channel.toString();
    this.gameId = game._id.toString();
    this.players = new PlayerManager(game.users);
    this.phase = new PhaseManager(this.eventEmitter);
    this.votes = new VoteManager();
    this.fortune = new FortuneManager(this.players, this.phase);
    this.medium = new MediumManager(this.players, this.phase);
    this.guard = new GuardManager(this.players, this.phase);    
    this.attack = new AttackManager(this.players, this.phase, this.guard);
    this.result = "running";
    this.isProcessing = false;
  }

  static createGame(game) {
    const gameId = game._id;
    games[gameId] = new GameState(game);
  }

  registerListeners() {
    this.eventEmitter.on("timerEnd", (currentPhase) => {
      this.isProcessing = true;

      if (currentPhase === "day")  this.handleDayPhaseEnd();
      if (currentPhase === "night")  this.handleNightPhaseEnd();
      if (currentPhase === "finished") return; // ゲーム削除の処理

      this.eventEmitter.emit("processCompleted", this.result);
    });

    this.eventEmitter.on("phaseSwiched", () => {
      this.updateGameState();
      this.isProcessing = false;
    });
  }

  handleDayPhaseEnd() {
    this.execution();
    if (this.result === "villageAbandoned") return;
    this.judgement();
  }

  handleNightPhaseEnd() {
    this.fortune.fortune();
    this.attack.attack();
    this.judgement();
  }

  judgement() {
    const livingPlayers = this.players.filter((pl) => pl.status === "alive");
    let villagers = 0;
    let werewolves = 0;

    livingPlayers.forEach((pl) => {
      pl.role !== "werewolf" ? villagers++ : werewolves++;
    });

    if (!werewolves) this.result = "villagersWin";
    if (werewolves >= villagers) this.result = "werewolvesWin";
  }

  execution() {
    const executionTargetId = votes.getExecutionTarget();
    const executionTarget = this.players.get(executionTargetId);

    if (!executionTarget) return this.result = "villageAbandoned";

    executionTarget.status = "dead";
    this.medium.medium(executionTarget);
  }

  updateGameState() {
    const gameState = this.getGameState();
    gameEvents.emit("updateGameState", gameState);
  }

  getGameState() {
    const users = this.players.players.map(({ role, ...rest }) => rest);
    const phase = {
      currentDay: this.phase.currentDay,
      currentPhase: this.phase.currentPhase,
      changedAt: this.phase.changedAt,
    }

    return {
      gameId: this.gameId,
      users: users,
      phase: phase,
    };
  }

  static isUserInGame(userId) {
    const game = Object.values(games).find((game) => 
      game.players.some((player) => player._id === userId)
    );
    if (game && game.result === "running") {
      return true;
    }
    return false;
  }
}

module.exports = { games, GameState, gameEvents };
