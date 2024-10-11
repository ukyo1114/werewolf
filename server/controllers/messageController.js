const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const {
  buildMessageQuery,
  getSendMessageType,
  canUserAccessChannel,
} = require("../utils/messageUtils");
const { channelEvents } = require("../socketHandlers/chatNameSpace");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, channelId } = req.body;
  const userId = req.user._id.toString();
  await canUserAccessChannel(channelId, userId);
  const messageType = await getSendMessageType(channelId, userId);

  const newMessage = {
    sender: req.user._id,
    content,
    channel: channelId,
    messageType,
  };

  const message = await Message.create(newMessage);
  channelEvents.emit("newMessage", message);
  
  res.status(201).end();
});

const getMessages = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const { messageId } = req.query;
  const userId = req.user._id.toString();
  await canUserAccessChannel(channelId, userId);
  const query = await buildMessageQuery(channelId, messageId, userId);

  let messages = await Message.find(query).sort({ createdAt: -1 }).limit(50);
  
  if (messageId) {
    messages = messages.filter((msg) => msg._id.toString() !== messageId);
  }

  res.json(messages);
});

module.exports = {
  sendMessage,
  getMessages,
};

// テスト済み