const Message = require("../models/messageModel");
const Game = require("../models/gameModel");
const { channelEvents } = require("../socketHandlers/chatNameSpace");

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
    this.result = { value: "running" };
    this.players = new PlayerManager(game.users);
    this.phase = new PhaseManager(this.eventEmitter, this.result);
    this.votes = new VoteManager(this.players, this.phase);
    this.fortune = new FortuneManager(this.players, this.phase);
    this.medium = new MediumManager(this.players, this.phase);
    this.guard = new GuardManager(this.players, this.phase);    
    this.attack = new AttackManager(this.players, this.phase, this.guard);
    this.isProcessing = false;
    this.registerListeners();
    this.sendMessage("ただいまゲームの準備中ですわ。もう少しお待ちくださいませ。");
  }

  static createGame(game) {
    const gameId = game._id;
    games[gameId] = new GameState(game);
  }

  registerListeners() {
    this.eventEmitter.on("timerEnd", () => this.handleTimerEnd());
    this.eventEmitter.on("phaseSwitched", () => this.handlePhaseSwitched());
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
    console.log("handleDayPhaseEnd", this.result.value);
    if (this.result.value === "villageAbandoned") return;
    this.judgement();
  }

  handleNightPhaseEnd() {
    this.fortune.fortune();
    this.attack.attack();
    this.judgement();
  }

  async handleGameEnd() {
    console.log("handleGameEnd");
    try {
      await Game.findByIdAndUpdate(this.gameId, { result: this.result.value });
      this.eventEmitter.removeListener("timerEnd", this.handleTimerEnd);
      this.eventEmitter.removeListener("phaseSwitched", this.handlePhaseSwitched);
      delete games[this.gameId];
    } catch (error) {
      console.error(`Failed to end game ${this.gameId}:`, error.message);
    }
  }

  judgement() {
    console.log("judgement");
    const livingPlayers = this.players.getLivingPlayers();
    let villagers = 0;
    let werewolves = 0;

    livingPlayers.forEach((pl) => {
      pl.role !== "werewolf" ? villagers++ : werewolves++;
    });

    if (werewolves === 0) this.result.value = "villagersWin";
    if (werewolves >= villagers) this.result.value = "werewolvesWin";
  }

  execution() {
    const executionTargetId = this.votes.getExecutionTarget();
    if (!executionTargetId) return this.result.value = "villageAbandoned";

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

  async sendMessage(message) {
    const newMessage = await this.createMessage(message);
    channelEvents.emit("newMessage", newMessage);
  }

  async createMessage(message) {
    const newMessage = {
      sender: "67111215dad82ea879cff67b", // GMのid
      content: message,
      channel: this.gameId,
      messageType: "normal",
    }

    await Message.create(newMessage);
    return newMessage;
  }

  static isUserInGame(userId) {
    const game = Object.values(games).find((game) => game.players.players.has(userId));
    return !! game && game.result === "running";
  }

  static isPlayingGame(userId) {
    const game = Object.values(games).find((game) =>
      Array.from(game.players.players.values()).some((pl) => pl._id === userId)
    );
    if (!game) return false;
    const currentPhase = game.phase.currentPhase;
    const player = game.players.getPlayerById(userId);
    const isPlaying = (currentPhase !== "finished" && player.status === "alive");

    return isPlaying ? game.gameId : null;
  }
}

module.exports = { games, GameState, gameEvents };

// テスト済み
