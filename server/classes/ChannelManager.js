const _  = require("lodash");
const EventEmitter   = require("events");

const Channel = require("../models/channelModel");
const Game = require("../models/gameModel");
const { games } = require("../controllers/gameControllers");
const CustomError = require("./CustomError");
const { errors } = require("../messages");
const { userGroups } = require("../controllers/messageControllers");

class ChannelManager {
  constructor(channelId, game = undefined) {
    this.channelId = channelId;
    this.users = new Map();
    this.game = game;
  }

  static async createUserGroup(channelId) {
    const [isChannel, isGame] = await Promise.all([
      Channel.exists({ _id: channelId }),
      Game.exists({ _id: channelId })
    ]);

    if (isChannel) {
      userGroups[channelId] = new ChannelManager(channelId);
      return userGroups[channelId];
    } else if (isGame) {
      const game = games[channelId];

      if (game) {
        userGroups[channelId] = new ChannelManager(channelId, game);
        return userGroups[channelId];
      } else {
        throw new CustomError(404, errors.GAME_NOT_FOUND);
      }
    } else {
      throw new CustomError(404, errors.CHANNEL_NOT_FOUND);
    }
  }

  async userJoined(userId, socketId) {
    const channelId = this.channelId;
    const game = this.game;

    const uExists = game
      ? await Game.exists({ _id: channelId, users: userId })
      : await Channel.exists({ _id: channelId, users: userId });
    if (!uExists) throw new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN);

    const user = { userId, socketId };

    if (game) {
      const player = game.players.players.get(userId);

      if (!player || player.status !== "alive") {
        user.status = "spectator";
      } else if (player.role === "werewolf") {
        user.status = "werewolf";
      } else {
        user.status = "normal";
      }
    } else {
      user.status = "normal";
    }

    this.users.set(userId, new UserManager(user));
    return user;
  }

  userLeft(userId) {
    this.users.delete(userId);
    if (this.users.size === 0) delete userGroups[this.channelId];
  }

  getSendMessageType(userId) {
    const user = this.users.get(userId);
    if (!user) throw new CustomError(403, errors.MESSAGE_SENDING_FORBIDDEN);

    const game = this.game;
    if (!game) return { messageType: "normal" };

    const currentPhase = this.game.phase.currentPhase;

    if (currentPhase === "finished") return { messageType: "normal" };
    if (user.status === "spectator") return { messageType: "spectator" };
    if (currentPhase !== "night") {
      return { messageType: "normal" };
    } else if (user.status === "werewolf") {
      return { messageType: "werewolf" };
    }

    throw new CustomError(403, errors.MESSAGE_SENDING_FORBIDDEN);
  }

  getMessageReceivers(messageType) {
    if (messageType === "normal") return { socketIds: null };
    const { spectators } = this.getSpectators();

    if (messageType === "spectator") return { socketIds: spectators };

    if (messageType === "werewolf") {
      const { werewolves } = this.getWerewolves();
      return { socketIds: _.union(spectators, werewolves) };
    }
  }

  getSpectators() {
    return {
      spectators: Array.from(this.users.values())
        .filter((user) => user.status === "spectator")
        .map((user) => user.socketId)
    };
  }

  getWerewolves() {
    return {
      werewolves: Array.from(this.users.values())
        .filter((user) => user.status === "werewolf")
        .map((user) => user.socketId)
    };
  }
}

class UserManager {
  constructor({ userId, socketId, status }) {
    this.userId = userId;
    this.socketId = socketId;
    this.status = status;
    this.eventEmitter = new EventEmitter();
    this.registerListeners();
  }

  registerListeners() {
    this.eventEmitter.on("kill", () => {
      this.status = "spectator";
    });
  }
}

module.exports = { ChannelManager, UserManager };

/* 
  normal werewolf spectator
  ユーザー追加時にアクセス権限を認証
  コンストラクタにisGameフィールドを追加

  games[channelId]の存在を保証する

  currentPhaseによって返す値が変化する関数を組み込む

  user = {
    userId, name, socketId, status
  }
*/