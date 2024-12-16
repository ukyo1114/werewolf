const asyncHandler = require("express-async-handler");

const Message = require("../models/messageModel");
const CustomError = require("../classes/CustomError");
const { channelEvents } = require("./channelControllers");
const { errors } = require("../messages");

const userGroups = {};

const sendMessage = asyncHandler(async (req, res) => {
  const { userId, body: { content, channelId } } = req;

  // ChannelManagerから情報を取得
  const userGroup = userGroups[channelId];
  if (!userGroup) throw new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN);
  const { messageType } = userGroup.getSendMessageType(userId);
  const { socketIds } = userGroup.getMessageReceivers(messageType);

  const message = await Message.create({
    sender: userId, content, channel: channelId, messageType,
  });
  
  channelEvents.emit("newMessage", message, socketIds);
  
  res.status(201).send();
});

const getMessages = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const { messageId } = req.query;
  const userId = req.userId;

  const getReceiveMessageType = (channelId, userId) => {
    const userGroup = userGroups[channelId];
    const user = userGroup?.users.get(userId);
    if (!user) throw new CustomError(403, errors.CHANNEL_ACCESS_FORBIDDEN);

    const currentPhase = userGroup.game?.phase.currentPhase;
    if (currentPhase === "finished") return null;
  
    if (user.status === "normal") return { $in: ["normal"] };
    if (user.status === "werewolf") return { $in: ["normal", "werewolf"] };
    if (user.status === "spectator") return null;
  };
  
  const query = { channel: channelId }; // データベースクエリ
  
  const messageType = getReceiveMessageType(channelId, userId); // メッセージタイプを設定
  if (messageType) query.messageType = messageType;
  
  if (messageId) { // メッセージの作成日時を設定
    const message = await Message.findById(messageId)
      .select("createdAt")
      .lean();
    if (!message) throw new CustomError(404, errors.MESSAGE_NOT_FOUND);
    query.createdAt = { $lte: message.createdAt };
  }

  let messages = await Message.find(query).sort({ createdAt: -1 }).limit(50);
  
  if (messageId) { // メッセージのダブりを排除
    messages = messages.filter((msg) => msg._id.toString() !== messageId);
  }

  res.status(201).json(messages);
});

module.exports = {
  sendMessage,
  getMessages,
  userGroups,
};