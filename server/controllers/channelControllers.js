const EventEmitter = require("events");
const asyncHandler = require("express-async-handler");

const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const { isUserAdmin } = require("../utils/channelUtils");

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

  res.status(200).json({ channelList });
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

  res.status(201).json({ channel });
});

const channelSettings = asyncHandler(async (req, res) => {
  const { channelId, channelName, description, password } = req.body;
  const { userId } = req;

  const { isChAdmin } = await isUserAdmin(channelId, userId);
  if (!isChAdmin) throw new CustomError(403, errors.PERMISSION_DENIED);

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

  const channel = await Channel.findById(channelId);
  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);

  const blockExists = await Channel.exists({
    _id: channelId, blockUsers: userId,
  });
  if (blockExists) throw new CustomError(403, errors.USER_BLOCKED);

  const userInChannel = await Channel.exists({
    _id: channelId, users: userId,
  });

  if (
    !userInChannel &&
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

  res.status(200).json({ channel: fullChannel });
});

const leaveChannel = asyncHandler(async (req, res) => {
  const { body: { channelId }, userId } = req;

  const { isChAdmin } = await isUserAdmin(channelId, userId);
  if (isChAdmin) throw new CustomError(403, errors.PERMISSION_DENIED);

  await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { users: userId } },
  );

  channelEvents.emit("userLeft", { channelId, userId });

  res.status(200).send();
});

module.exports = {
  channelEvents,
  getChannelList,
  createChannel,
  channelSettings,
  joinChannel,
  leaveChannel,
};
