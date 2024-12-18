const Game = require("../models/gameModel");
const { GameState } = require("./GameState");
const EventEmitter = require("events");
const entryEvents = new EventEmitter();

const entryUsers = {};

class Entry {
  static MAX_USERS = 10

  constructor(channelId) {
    this.channelId = channelId;
    this.users = [];
    this.isGameStarting = false;
  }

  async register(socketId, userId) {
    if (this.isGameStarting) return;

    this.users.push({ socketId: socketId, userId: userId });

    if (this.users.length === Entry.MAX_USERS) {
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
    entryEvents.emit("entryUpdate", {
      channelId: this.channelId,
      userList: this.userList(),
    });
  }

  async startGame() {
    try {
      const { _id: gameId } = await Game.create({
        users: this.userList(),
        channel: this.channelId,
        result: "running",
      });

      const newGame = await Game.findById(gameId)
        .select("_id users channel")
        .populate("users", "_id name");

      GameState.createGame(newGame);

      entryEvents.emit("gameStart", {
        socketIds: this.users.map((user) => user.socketId), gameId,
      });
    } catch (error) {
      this.gameCreationFailed(error);
    } finally {
      this.reset();
    }
  }

  gameCreationFailed(error) {
    console.error("error:", error.message);
    entryEvents.emit("gameCreationFailed", { channelId: this.channelId });
  }

  reset() {
    this.users = [];
    this.isGameStarting = false;
  }
}

module.exports = { Entry, entryUsers, entryEvents };
