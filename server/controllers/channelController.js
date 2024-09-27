const asyncHandler = require('express-async-handler');
const Channel = require('../models/channelModel');
const User = require('../models/userModel');
const EventEmitter = require('events');
const channelEvents = new EventEmitter();
const { messages, errors } = require('../messages');
const CustomError = require('../classes/CustomError');
const {
  getChannelById,
  isChannelAdmin,
  isUserBlocked,
} = require('../utils/channelUtils');

const fetchChannelList = asyncHandler(async (req, res) => {
  const channels = await Channel.find({}).populate(
    "channelAdmin",
    "_id name pic",
  );

  const channelList = channels.map((channel) => {
    const { password, ...rest } = channel.toJSON({ virtuals: true });
    return rest;
  });

  res.status(200).json(channelList);
});

const createChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { channelName, description, password } = req.body;

  if (!channelName || !description) {
    throw new CustomError(400, errors.MISSING_DATA);
  }

  const channel = await Channel.create({
    channelName: channelName,
    description: description,
    users: [userId],
    channelAdmin: userId,
    password: password,
    blockUsers: [],
  });

  const fullChannel = await Channel.findById(channel._id)
    .select("-password")
    .populate("users", "_id name pic");

  res.status(201).json(fullChannel);
});

const channelSettings = asyncHandler(async (req, res) => {
  const { channelId, channelName, description, password } = req.body;
  const userId = req.user._id.toString();

  const channel = await getChannelById(channelId);
  isChannelAdmin(channel, userId);

  if (channelName) channel.channelName = channelName;
  if (description) channel.description = description;
  if (password !== undefined) channel.password = password;

  await channel.save();

  const updatedChannel = await Channel.findById(channel._id.toString())
    .select("channelName description");

  res.status(200).json(updatedChannel);
});

const enterToChannel = asyncHandler(async (req, res) => {
  const { channelId, password } = req.body;
  const userId = req.user._id.toString();

  if (!channelId) {
    return res.status(400).json({ error: errors.CHANNEL_ID_MISSING });
  }

  const channel = await getChannelById(channelId);
  isUserBlocked(channel, userId);
  const isUserInChannel = channel.users.some((u) => u.toString() === userId);
  
  if (
    !isUserInChannel &&
    channel.password &&
    !(await channel.matchPassword(password))
  ) throw new CustomError(401, errors.INVALID_PASSWORD);

  const fullChannel = await Channel.findByIdAndUpdate(
    channelId,
    { $addToSet: { users: userId } },
    { new: true },
  )
    .select("-password")
    .populate("users", "_id name pic");

  const user = await User.findById(userId).select("_id name pic");

  channelEvents.emit("user added", { channelId: channelId, user: user }); 

  res.json(fullChannel);
});

const leaveChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { channelId } = req.body;

  if (!channelId) {
    return res.status(400).json({ error: errors.CHANNEL_ID_MISSING });
  }

  const channel = await getChannelById(channelId);

  if (channel.channelAdmin.toString() === userId) {
    throw new CustomError(403, errors.PERMISSION_DENIED);
  }

  await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { users: userId } },
    { new: true },
  );

  channelEvents.emit("user left", {
    channelId: channelId,
    userId: userId,
  });

  res.status(200).json({ message: messages.LEFT_CHANNEL });
});

const getBlockUserList = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const userId = req.user._id.toString();

  const channel = await Channel.findById(channelId)
    .select("channelAdmin blockUsers")
    .populate("blockUsers", "_id name pic");

  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);
  isChannelAdmin(channel, userId);

  res.status(200).json(channel.blockUsers);
});

const block = asyncHandler(async (req, res) => {
  const { channelId, selectedUser } = req.body;
  const userId = req.user._id.toString();

  if (!channelId) throw new CustomError(400, errors.CHANNEL_ID_MISSING);
  if (selectedUser === userId) throw new CustomError(403, errors.SELF_BLOCK);

  const channel = await getChannelById(channelId);

  isChannelAdmin(channel, userId);

  if (channel.blockUsers.some((u) => u.toString() === selectedUser)) {
    throw new CustomError(400, errors.USER_ALREADY_BLOCKED);
  }

  channel.blockUsers.push(selectedUser);
  channel.users = channel.users.filter((u) => u.toString() !== selectedUser,);
  await channel.save();

  channelEvents.emit("add blockUser", {
    channelId: channelId,
    blockUser: selectedUser,
  });

  res.status(200).json(selectedUser);
});

const cancelBlock = asyncHandler(async (req, res) => {
  const { channelId, selectedBlockUser } = req.body;
  const userId = req.user._id.toString();

  const channel = await getChannelById(channelId);
  isChannelAdmin(channel, userId);

  if (!channel.blockUsers.some((user) => 
    user.toString() === selectedBlockUser
  )) throw new CustomError(400, errors.USER_NOT_BLOCKED);

  channel.blockUsers = channel.blockUsers.filter((user) => 
    user.toString() !== selectedBlockUser
  );

  await channel.save();

  channelEvents.emit("cancel blockUser", {
    channelId: channelId,
    blockUser: selectedBlockUser,
  });

  res.status(200).json(channel.blockUsers.map((user) => user.toString()));
});

const userList = asyncHandler(async (req, res) => {
    const channel = await Channel.findById(req.params.channelId)
      .populate("users", "_id name pic");

    if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);

    res.status(200).json(channel.users);
});

module.exports = {
  channelEvents,
  fetchChannelList,
  createChannel,
  channelSettings,
  enterToChannel,
  leaveChannel,
  userList,
  getBlockUserList,
  block,
  cancelBlock,
};
