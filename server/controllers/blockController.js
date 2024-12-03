const asyncHandler = require("express-async-handler");

const Channel = require("../models/channelModel");
const { channelEvents } = require("./channelController");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const {
  getChannelById,
  isChannelAdmin,
} = require("../utils/channelUtils");

const getBlockUsers = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const userId = req.userId;

  const channel = await Channel.findById(channelId)
    .select("channelAdmin blockUsers")
    .populate("blockUsers", "_id name pic");

  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);
  isChannelAdmin(channel, userId);

  res.status(200).json(channel.blockUsers);
});

const registerBlock = asyncHandler(async (req, res) => {
  const { channelId, selectedUser } = req.body;
  const userId = req.userId;
  if (selectedUser === userId) throw new CustomError(403, errors.SELF_BLOCK);

  const channel = await getChannelById(channelId, false);

  isChannelAdmin(channel, userId);

  if (channel.blockUsers.some((u) => u.toString() === selectedUser)) {
    throw new CustomError(400, errors.USER_ALREADY_BLOCKED);
  }

  channel.blockUsers.push(selectedUser);
  channel.users = channel.users.filter((u) => u.toString() !== selectedUser,);
  
  await channel.save();

  channelEvents.emit("registerBlockUser", {
    channelId: channelId,
    blockUser: selectedUser,
  });

  res.status(200).json(selectedUser);
});

const cancelBlock = asyncHandler(async (req, res) => {
  const { channelId, selectedBlockUser } = req.body;
  const userId = req.userId;

  const channel = await getChannelById(channelId, false);
  isChannelAdmin(channel, userId);

  if (!channel.blockUsers.some((user) => 
    user.toString() === selectedBlockUser
  )) throw new CustomError(400, errors.USER_NOT_BLOCKED);

  channel.blockUsers = channel.blockUsers.filter((user) => 
    user.toString() !== selectedBlockUser
  );

  await channel.save();

  channelEvents.emit("cancelBlockUser", {
    channelId: channelId,
    blockUser: selectedBlockUser,
  });

  res.status(200).json(channel.blockUsers.map((user) => user.toString()));
});

module.exports = {
  getBlockUsers,
  registerBlock,
  cancelBlock,
};