const asyncHandler = require('express-async-handler');
const Message = require("../models/messageModel");
const { games } = require("../classes/GameState");
const { messages, errors } = require('../messages');
const CustomError = require('../classes/CustomError');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, channelId } = req.body;

  if (!content || !channelId) {
    throw new CustomError(400, errors.MISSING_DATA);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    channel: channelId,
    messageType: req.messageType,
  };

  const message = await Message.create(newMessage);
  res.json(message);
});

const checkGameState = (req, res, next) => {
  const { channelId } = req.body;
  const userId = req.user._id.toString();
  const game = games[channelId];

  if (!game) {
    req.messageType = "normal";
    return next();
  }

  const player = game.players.find((player) => player._id === userId);
  if (!player) throw new CustomError(404, errors.PLAYER_NOT_FOUND);

  const currentPhase = game.phases.currentPhase;

  if (currentPhase === "pre" || currentPhase === "end") {
    req.messageType = "normal";
  } else if (currentPhase === "day" && player.status === "alive") {
    req.messageType = "normal";
  } else if (currentPhase === "night" && player.status === "alive") {
    req.messageType = player.role === "werewolf" ? "werewolf" : "forbidden";
  } else {
    req.messageType = "spectator";
  }
  
  return next();
};

const getMessages = asyncHandler(async (req, res) => {
  const { messageId } = req.query;
  const channelId = req.params.channelId;
  let message;

  if (messageId) {
    message = await Message.findById(messageId);
    if (!message) throw new CustomError(404, errors.MESSAGE_NOT_FOUND);
  }

  const query = { channel: channelId };

  if (!games[channelId]) {
    query.messageType = { $in: ["normal", "werewolf", "spectator"] };
  } else if (req.messageType === "spectator") {
    query.messageType = { $in: ["normal", "werewolf", "spectator"] };
  } else if (games[channelId]?.players.some((player) =>
      player._id === req.user._id.toString() && player.role === "werewolf",
    )
  ) {
    query.messageType = { $in: ["normal", "werewolf"] };
  } else {
    query.messageType = { $in: ["normal"] };
  }

  if (message) {
    query.createdAt = { $lte: message.createdAt };
  }

  let messages = await Message.find(query).sort({ createdAt: -1 }).limit(50);
  
  if (messageId) {
    messages = messages.filter((msg) => msg._id.toString() !== messageId);
  }

  res.json(messages);
});

const connect = asyncHandler(async (req, res) => {
  const { messageId } = req.query;
  const channelId = req.params.channelId;
  let message;

  if (messageId) {
    message = await Message.findById(messageId);
    if (!message) throw new CustomError(404, errors.MESSAGE_NOT_FOUND);
  }
  const query = { channel: channelId };
  if (!games[channelId]) {
    query.messageType = { $in: ["normal", "werewolf", "spectator"] };
  } else if (req.messageType === "spectator") {
    query.messageType = { $in: ["normal", "werewolf", "spectator"] };
  } else if (
    games[channelId]?.players.some((player) =>
      player._id === req.user._id.toString() && player.role === "werewolf",
    )
  ) {
    query.messageType = { $in: ["normal", "werewolf"] };
  } else {
    query.messageType = { $in: ["normal"] };
  }

  if (message) {
    query.createdAt = { $gt: message.createdAt };
  }
  
  let messages = await Message.find(query).sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = {
  checkGameState,
  sendMessage,
  getMessages,
  connect,
};