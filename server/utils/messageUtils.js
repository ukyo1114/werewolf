const _ = require("lodash");

const Message = require("../models/messageModel");
const Channel = require("../models/channelModel");
const Game = require("../models/gameModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");
const { games } = require("../controllers/gameController");

const buildMessageQuery = async (channelId, messageId, userId) => {
  const query = { channel: channelId };
  if (messageId) {
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError(404, errors.MESSAGE_NOT_FOUND);
    query.createdAt = { $lte: message.createdAt };
  }

  const messageType = await getReceiveMessageType(channelId, userId);
  if (messageType) query.messageType = messageType;

  return query;
};

async function getReceiveMessageType(channelId, userId) {
  const game = games[channelId];
  if (!game) return null;
  const player = game.players.players.get(userId);
  return receiveMessageTypeForPl(player);
}

function receiveMessageTypeForPl(player) {
  if (!player || player.status !== "alive") return null;
  if (player.role === "werewolf") return { $in: ["normal", "werewolf"] };
  return { $in: ["normal"] };
}

const getSendMessageType = async (channelId, userId) => {
  if (await Channel.exists({ _id: channelId })) return "normal"

  const game = games[channelId];
  if (!game)  throw new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN);

  const player = game.players.players.get(userId);
  const currentPhase = game.phase.currentPhase;
  
  return sendMessageTypeForPl(player, currentPhase);
};

function sendMessageTypeForPl(player, currentPhase) {
  if (!player || player.status !== "alive") return "spectator";
  if (currentPhase !== "night") return "normal";
  if (player.role === "werewolf") return "werewolf";

  throw new CustomError(403, errors.MESSAGE_SENDING_FORBIDDEN);
}

const canUserAccessChannel = async (channelId, userId) => {
  const game = await Game.findById(channelId).select("channel").lean();
  const targetChannelId = game ? game.channel.toString() : channelId;
  
  await isUserInChannel(targetChannelId, userId);
}

async function getIdType(channelId) {
  const result = { type: "channel", gameExists: false };

  if (await Game.exists({ _id: channelId })) {
    result.type = "game";
    result.gameExists = Boolean(games[channelId]);
  }

  return result;
};

async function isUserInChannel(channelId, userId) {
  const exists = await Channel.exists({ _id: channelId, users: userId });

  if (!exists) throw new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN);
};

const usersCanReceive = async(channelId, messageType) => {
  if (messageType !== "spectator" && messageType !== "werewolf") return null;
  const gameState = games[channelId];
  if (!gameState) return null;
  const spectators = await getSpectators(channelId, gameState);
  if (messageType === "spectator") return spectators;
  const werewolf = gameState.players.getWerewolves();
  return _.union(spectators, werewolf);
};

async function getSpectators(channelId, gameState) {
  const game = await Game.findById(channelId).select("users").lean();
  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);
  const users = game.users.map((user) => user.toString());
  const livingPlayers = gameState.players.getLivingPlayers();
  const livingPlayerIds = livingPlayers.map((pl) => pl._id); 
  const spectators = _.difference(users, livingPlayerIds);
  return spectators;
} 

module.exports = {
  buildMessageQuery,
  getSendMessageType,
  canUserAccessChannel,
  usersCanReceive,

  getReceiveMessageType,
  receiveMessageTypeForPl,
  sendMessageTypeForPl,
  getIdType,
  isUserInChannel,

  getSpectators,
};