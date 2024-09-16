const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Channel = require("../models/channelModel");
const asyncHandler = require("express-async-handler");
const { games } = require("../classes/gameState");

const router = express.Router();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized, Token Failed !");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, Token Failed !");
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, channelId } = req.body;
  if (!content || !channelId) {
    console.log("Invalid Data Passed into Request");
    res.sendStatus(400);
  }
  const newMessage = {
    sender: req.user._id,
    content: content,
    channel: channelId,
    messageType: req.messageType,
  };
  try {
    var message = await Message.create(newMessage);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const checkGameState = (req, res, next) => {
  const { channelId } = req.body;
  const userId = req.user._id.toString();
  if (!games[channelId]) {
    req.messageType = "normal";
    return next();
  }
  const player = games[channelId].players.find(
    (player) => player._id === userId,
  );
  if (!player)
    return res
      .status(403)
      .json({ error: "プレイヤーが確認できないようです。" });
  const currentPhase = games[channelId].phases.currentPhase;
  if (currentPhase === "pre" || currentPhase === "end") {
    req.messageType = "normal";
    return next();
  }
  if (currentPhase === "day" && player.status === "alive") {
    req.messageType = "normal";
    return next();
  }
  if (currentPhase === "night" && player.status === "alive") {
    if (player.role !== "werewolf") {
      req.messageType = "forbidden";
      return next();
    } else {
      req.messageType = "werewolf";
      return next();
    }
  }
  req.messageType = "spectator";
  return next();
};

const getMessages = async (req, res) => {
  try {
    const { messageId } = req.query;
    const channelId = req.params.channelId;
    let message;
    if (messageId) {
      message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
    }
    const query = { channel: channelId };
    if (!games[channelId]) {
      query.messageType = { $in: ["normal", "werewolf", "spectator"] };
    } else if (req.messageType === "spectator") {
      query.messageType = { $in: ["normal", "werewolf", "spectator"] };
    } else if (
      games[channelId]?.players.some(
        (player) =>
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
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const connect = async (req, res) => {
  try {
    const { messageId } = req.query;
    const channelId = req.params.channelId;
    let message;
    if (messageId) {
      message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
    }
    const query = { channel: channelId };
    if (!games[channelId]) {
      query.messageType = { $in: ["normal", "werewolf", "spectator"] };
    } else if (req.messageType === "spectator") {
      query.messageType = { $in: ["normal", "werewolf", "spectator"] };
    } else if (
      games[channelId]?.players.some(
        (player) =>
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
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

router.post("/", protect, checkGameState, sendMessage);
router.get("/getmessages/:channelId", protect, getMessages);
router.get("/connect/:channelId", protect, connect);

module.exports = router;
