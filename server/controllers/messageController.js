const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const { games } = require("../classes/gameState");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id");
      return next();
    } catch (error) {
      return res.status(401);
    }
  }
  if (!token) return res.status(401);
};

const sendMessage = async (req, res) => {
  const { content, channelId } = req.body;
  if (!content || !channelId) {
    return res.status(400).json({ error: "必要なデータが無いようです。" });
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
    res.status(500).json({ error: error.message });
    console.error("エラー:", error.message);
  }
};

const checkGameState = (req, res, next) => {
  const { channelId } = req.body;
  const userId = req.user._id.toString();
  const game = games[channelId];

  if (!game) {
    req.messageType = "normal";
    return next();
  }

  const player = game.players.find((player) => player._id === userId);
  if (!player) {
    return res
    .status(403)
    .json({ error: "プレイヤーが確認できないようです。" });
  }

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

const getMessages = async (req, res) => {
  try {
    const { messageId } = req.query;
    const channelId = req.params.channelId;
    let message;
    if (messageId) {
      message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "メッセージが見つからないようです。" });
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
    res.status(500).json({ error: error.message });
    console.error("エラー:", error.message);
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
        return res.status(404).json({ error: "メッセージが見つからないようです。" });
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
    res.status(500).json({ error: error.message });
    console.error("エラー:", error.message);
  }
};

module.exports = {
  protect,
  checkGameState,
  sendMessage,
  getMessages,
  connect,
};