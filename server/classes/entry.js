const Game = require("../models/gameModel");
const { GameState } = require("./GameState");
const EventEmitter = require("events");
const entryEvents = new EventEmitter();

const entryUsers = {};

class Entry {
  constructor(channelId) {
    this.channelId = channelId;
    this.users = [];
    this.isGameStarting = false;
  }

  async register(socketId, userId) {
    if (this.isGameStarting) return;
    this.users.push({
      socketId: socketId,
      userId: userId,
    });
    if (this.users.length === 10) {
      // Magic Number
      this.isGameStarting = true;
      await this.startGame();
    }
    this.entryUpdate();
  }

  cancel(socketId) {
    if (this.isGameStarting) return;
    this.users = this.users.filter((user) => user.socketId !== socketId);
    this.entryUpdate();
  }

  userList() {
    return this.users.map((user) => user.userId);
  }

  entryUpdate() {
    entryEvents.emit("entry update", {
      channelId: this.channelId,
      userList: this.userList(),
    });
  }

  async startGame() {
    try {
      const game = await Game.create({
        users: this.userList(),
        channel: this.channelId,
        result: "running",
      });
      const fullGame = await Game.findOne({ _id: game._id }).populate(
        "users",
        "_id name pic",
      );
      GameState.createGame(fullGame);

      entryEvents.emit("game start", {
        socketIds: this.users.map((user) => user.socketId),
        fullGame: fullGame,
      });
    } catch (error) {
      console.error("ゲームの作成に失敗したようです。", error.message);
      entryEvents.emit("game error", {
        channelId: this.channelId,
        message: "ゲームの作成に失敗したようです。",
        error: error.message,
      });
    } finally {
      this.reset();
    }
  }

  reset() {
    this.users = [];
    this.isGameStarting = false;
  }
}

module.exports = { Entry, entryUsers, entryEvents };
