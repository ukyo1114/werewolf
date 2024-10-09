const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel")
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");
const { games } = require("../classes/GameState");

const buildMessageQuery = asyncHandler(async (channelId, messageId) => {
  const query = { channel: channelId };
  if (messageId) {
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError(404, errors.MESSAGE_NOT_FOUND);
    query.createdAt = { $lte: message.createdAt };
  }

  return query;
});

const getMessageTypes = (channelId, userId) => {
  const game = games[channelId];
  if (!game) return { $in: ["normal", "werewolf", "spectator"] };

  try {
    const player = game.players.find((pl) => pl._id === userId);
    if (!player || player.status === "dead") {
      return { $in: ["normal", "werewolf", "spectator"] };
    }

    if (player.role === "werewolf") {
      return { $in: ["normal", "werewolf"] };
    } else {
      return { $in: ["normal"] };
    }
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
}

const getSendMessageType = (channelId, userId) => {
  const game = games[channelId];
  if (!game) return "normal";

  try {
    const player = game.players.find((pl) => pl._id === userId);
    if (!player || player.status !== "alive") return "spectator";

    const currentPhase = game.phase.currentPhase;
    if (currentPhase !== "night") {
      return "normal";
    } else {
      return player.role !== "werewolf" ? "forbidden" : "werewolf";
    }
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

module.exports = {
  buildMessageQuery,
  getMessageTypes,
  getSendMessageType,
};