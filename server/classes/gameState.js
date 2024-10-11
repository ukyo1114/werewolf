const Game = require("../models/gameModel");
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
    this.result = "running";
    this.players = new PlayerManager(game.users);
    this.phase = new PhaseManager(this.eventEmitter, this.result);
    this.votes = new VoteManager(this.players, this.phase);
    this.fortune = new FortuneManager(this.players, this.phase);
    this.medium = new MediumManager(this.players, this.phase);
    this.guard = new GuardManager(this.players, this.phase);    
    this.attack = new AttackManager(this.players, this.phase, this.guard);
    this.isProcessing = false;
  }

  static createGame(game) {
    const gameId = game._id;
    games[gameId] = new GameState(game);
  }

  registerListeners() {
    this.eventEmitter.on("timerEnd", this.handleTimerEnd);
    this.eventEmitter.on("phaseSwitched", this.handlePhaseSwitched);
  }

  handleTimerEnd() {
    const { currentPhase } = this.phase;
    this.isProcessing = true;

    if (currentPhase === "day")  this.handleDayPhaseEnd();
    if (currentPhase === "night")  this.handleNightPhaseEnd();
    if (currentPhase === "finished") return this.handleGameEnd();

    this.eventEmitter.emit("processCompleted");
  }

  handlePhaseSwitched() {
    this.updateGameState();
    this.isProcessing = false;
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

  async handleGameEnd() {
    try {
      await Game.findByIdAndUpdate(this.gameId, { result: this.result });
      this.eventEmitter.removeListener("timerEnd", this.handleTimerEnd);
      this.eventEmitter.removeListener("phaseSwitched", this.handlePhaseSwitched);
      delete games[this.gameId];
    } catch (error) {
      console.error(`Failed to end game ${this.gameId}:`, error.message);
    }
  }

  judgement() {
    const livingPlayers = this.players.getLivingPlayers();
    let villagers = 0;
    let werewolves = 0;

    livingPlayers.forEach((pl) => {
      pl.role !== "werewolf" ? villagers++ : werewolves++;
    });

    if (werewolves === 0) this.result = "villagersWin";
    if (werewolves >= villagers) this.result = "werewolvesWin";
  }

  execution() {
    const executionTargetId = this.votes.getExecutionTarget();
    if (!executionTargetId) return this.result = "villageAbandoned";

    this.players.kill(executionTargetId);
    this.medium.medium(executionTargetId);
  }

  updateGameState() {
    const gameState = this.getGameState();
    gameEvents.emit("updateGameState", gameState);
  }

  getGameState() {
    const users = this.players.getPlayersWithoutRole();
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
    const game = Object.values(games).find((game) => game.players.has(userId));
    return !!game && game.result === "running";
  }
}

module.exports = { games, GameState, gameEvents };

// テスト済み
