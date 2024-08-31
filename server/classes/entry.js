const Game = require('../models/gameModel');

const entryUsers = {};

class Entry {
  constructor (channelId) {
    this.channelId = channelId;
    this.entryNameSpace = null; 
    this.users = new Map();
    this.inProgress = false;
  }

  register(socketId, user) {
    if (!this.inProgress) {
      this.users.set(socketId, user);
      if (this.users.size === 10) {
        this.inProgress = true;
        this.startGame();
      }
      this.entryUpdate();
    }
  }

  cancel(socketId) {
    if (!this.inProgress) {
      this.users.delete(socketId);
      this.entryUpdate();
    }
  }

  userList() {
    return Array.from(this.users.values());
  }

  entryUpdate() {
    try {
      this.entryNameSpace.in(this.channelId).emit('entry update', this.userList());
    } catch (error) {
      console.error(`Error during entry update for channel ${this.channelId}:`, error.message);
    }
  }

  async startGame() {
    try {
      const game = await Game.create({
        users: this.userList(),
        channel: this.channelId,
        result: 'running'
      });
      const fullGame = await Game.findOne({ _id: game._id})
      .populate('users', '_id name pic');
      // GameState.createGame(fullGame);
      for (const socketId of this.users.keys()) {
        this.entryNameSpace.to(socketId).emit("game start", fullGame);
      }
    } catch (error) {
      console.error('Error creating game:', error.message);
    } finally {
      this.users = new Map();
      this.inProgress = false;
    }
  }
}

module.exports = { Entry, entryUsers };
// 要らないコメントああああああああああああああああああああああああああああああ