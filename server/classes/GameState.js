const Message = require("../models/messageModel");
const Game = require("../models/gameModel");

const { gameMaster } = require("../messages");

const { games } = require("../controllers/gameController");
const { channelEvents } = require("../controllers/channelController");

const PlayerManager  = require("./PlayerManager");
const VoteManager    = require("./VoteManager");
const FortuneManager = require("./FortuneManager");
const AttackManager  = require("./AttackManager");
const GuardManager   = require("./GuardManager");
const MediumManager  = require("./MediumManager");
const PhaseManager   = require("./PhaseManager");
const EventEmitter   = require("events");

const gameEvents = new EventEmitter();

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
    this.sendMessage(gameMaster.PREPARATION);
  }

  static createGame(game) {
    const gameId = game._id;
    games[gameId] = new GameState(game);
  }

  registerListeners() {
    this.eventEmitter.on("timerEnd", async() => await this.handleTimerEnd());
    this.eventEmitter.on("phaseSwitched", () => this.handlePhaseSwitched());
  }

  async handleTimerEnd() {
    const { currentPhase } = this.phase;
    this.isProcessing = true;

    if (currentPhase === "pre") await this.sendMessage(gameMaster.MORNING);
    if (currentPhase === "day")  await this.handleDayPhaseEnd();
    if (currentPhase === "night")  await this.handleNightPhaseEnd();
    if (currentPhase === "finished") return this.handleGameEnd();

    this.eventEmitter.emit("processCompleted");
  }

  handlePhaseSwitched() {
    this.updateGameState();
    this.isProcessing = false;
  }

  async handleDayPhaseEnd() {
    await this.execution();
    if (this.result.value === "villageAbandoned") return;
    await this.judgement();
    if (this.result.value === "running") {
      await this.sendMessage(gameMaster.NIGHT);
    }
  }

  async handleNightPhaseEnd() {
    this.fortune.fortune();
    const player = this.attack.attack();
    await this.sendMessage(gameMaster.ATTACK(player?.name));
    await this.judgement();
    if (this.result.value === "running") {
      await this.sendMessage(gameMaster.MORNING);
    }
  }

  async handleGameEnd() {
    try {
      await Game.findByIdAndUpdate(this.gameId, { result: this.result.value });
      this.eventEmitter.removeListener("timerEnd", this.handleTimerEnd);
      this.eventEmitter.removeListener("phaseSwitched", this.handlePhaseSwitched);
      delete games[this.gameId];
    } catch (error) {
      console.error(`Failed to end game ${this.gameId}:`, error.message);
    }
  }

  async judgement() {
    const livingPlayers = this.players.getLivingPlayers();
    let villagers = 0;
    let werewolves = 0;

    livingPlayers.forEach((pl) => {
      pl.role !== "werewolf" ? villagers++ : werewolves++;
    });

    if (werewolves === 0) {
      this.result.value = "villagersWin";
      await this.sendMessage(gameMaster.VILLAGERS_WIN);
    }
    if (werewolves >= villagers) {
      this.result.value = "werewolvesWin";
      await this.sendMessage(gameMaster.WEREWOLVES_WIN);
    }
  }

  async execution() {
    const executionTarget = this.votes.getExecutionTarget();
    if (!executionTarget) return await this.villageAbandoned();

    this.players.kill(executionTarget._id);
    await this.sendMessage(gameMaster.EXECUTION(executionTarget.name));
    this.medium.medium(executionTarget._id);
  }

  async villageAbandoned() {
    this.result.value = "villageAbandoned";
    await this.sendMessage(gameMaster.VILLAGE_ABANDONED);
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
    const newMessage = await Message.create({
      sender: "672626acf66b851cf141bd0f", // GMのid
      content: message,
      channel: this.gameId,
      messageType: "normal",
    });

    return newMessage;
  }

  static isUserInGame(userId) {
    const game = Object.values(games).find((game) => game.players.players.has(userId));
    return !! game && game.result.value === "running";
  }

  static isPlayingGame(userId) {
    const game = Object.values(games).find((game) =>
      Array.from(game.players.players.values()).some((pl) => pl._id === userId)
    );
    if (!game) return null;
    const currentPhase = game.phase.currentPhase;
    const player = game.players.getPlayerById(userId);
    const isPlaying = (currentPhase !== "finished" && player.status === "alive");

    return isPlaying ? game.gameId : null;
  }
}

module.exports = { games, GameState, gameEvents };