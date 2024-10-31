const asyncHandler = require("express-async-handler");
const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const { channelEvents } = require("../socketHandlers/chatNameSpace");
const { messages, errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const {
  getChannelById,
  isChannelAdmin,
  isUserBlocked,
} = require("../utils/channelUtils");

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
  
  const channel = await Channel.create({
    channelName: channelName,
    description: description,
    users: [userId],
    channelAdmin: userId,
    password: password,
    blockUsers: [],
  });

  const fullChannel = await Channel.findById(channel._id)
    .select("_id channelName description users channelAdmin blockUsers")
    .populate("users", "_id name pic");

  res.status(201).json(fullChannel);
});

const channelSettings = asyncHandler(async (req, res) => {
  const { channelId, channelName, description, password } = req.body;
  const userId = req.user._id.toString();

  const channel = await getChannelById(channelId, false);
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

  channelEvents.emit("userJoined", { channelId: channelId, user: user }); 

  res.json(fullChannel);
});

const leaveChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { channelId } = req.body;

  const channel = await getChannelById(channelId);

  if (channel.channelAdmin.toString() === userId) {
    throw new CustomError(403, errors.PERMISSION_DENIED);
  }

  await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { users: userId } },
    { new: true },
  );

  channelEvents.emit("userLeft", {
    channelId: channelId,
    userId: userId,
  });

  res.status(200).json({ message: messages.LEFT_CHANNEL });
});

module.exports = {
  channelEvents,
  fetchChannelList,
  createChannel,
  channelSettings,
  enterToChannel,
  leaveChannel,
};
