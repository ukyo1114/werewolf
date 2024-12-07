const EventEmitter = require("events");
const asyncHandler = require("express-async-handler");

const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const { messages, errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const {
  getChannelById,
  isUserAdmin,
} = require("../utils/channelUtils");

const channelEvents = new EventEmitter();

const getChannelList = asyncHandler(async (req, res) => {
  const channelList = await Channel.find({})
    .select("-password")
    .populate(
      "channelAdmin",
      "_id name pic",
    )
    .lean();
  
  if (channelList.length === 0) {
    throw new CustomError(404, errors.CHANNEL_NOT_FOUND);
  }

  res.status(200).json({ channelList }); // client側の実装を確認
});

const createChannel = asyncHandler(async (req, res) => {
  const { body: { channelName, description, password }, userId } = req;
  
  const { _id } = await Channel.create({
    channelName,
    description,
    users: [userId],
    channelAdmin: userId,
    password,
  });

  const channel = await Channel.findById(_id)
    .select("-password -hasPassword")
    .populate("users", "_id name pic")
    .lean();

  res.status(201).json({ channel }); // client側の実装を確認
});

const channelSettings = asyncHandler(async (req, res) => {
  const { channelId, channelName, description, password } = req.body;
  const { userId } = req;

  await isUserAdmin(channelId, userId);

  const channel = await Channel.findById(channelId).select("-password");
  if (channelName) channel.channelName = channelName;
  if (description) channel.description = description;
  if (password !== undefined) channel.password = password;
  await channel.save();

  const updatedChannel = await Channel.findById(channelId)
    .select("channelName description")
    .lean();

  channelEvents.emit("cSettingsChanged", { channelId, updatedChannel }); 

  res.status(200).send();
});

const joinChannel = asyncHandler(async (req, res) => {
  const { body: { channelId, password }, userId } = req;

  const channel = await getChannelById(channelId);

  if (channel.blockUsers.some((u) => u.toString() === userId)) {
    throw new CustomError(403, errors.USER_BLOCKED);
  }

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
    .select("-password -hasPassword")
    .populate("users", "_id name pic")
    .lean();

  const user = await User.findById(userId).select("_id name pic").lean();

  channelEvents.emit("userJoined", { channelId, user }); 

  res.status(200).json({ channel: fullChannel }); // client側の実装を確認
});

const leaveChannel = asyncHandler(async (req, res) => {
  const { body: { channelId }, userId } = req;

  const isChAdmin = await isUserAdmin(channelId, userId);
  if (isChAdmin) throw new CustomError(403, errors.PERMISSION_DENIED);

  await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { users: userId } },
  );

  channelEvents.emit("userLeft", { channelId, userId });

  res.status(200).send(); // client側の実装を確認
});

module.exports = {
  channelEvents,
  getChannelList,
  createChannel,
  channelSettings,
  joinChannel,
  leaveChannel,
};
