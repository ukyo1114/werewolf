const Channel = require("../models/channelModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");

const getChannelById = async (channelId, password = true) => {
  let query = Channel.findById(channelId);
  if (!password) query = query.select("-password");

  const channel = await query;
  
  if (!channel) {
    throw new CustomError(404, errors.CHANNEL_NOT_FOUND);
  }

  return channel;
};

const isChannelAdmin = (channel, userId) => {
  if (channel.channelAdmin.toString() !== userId) {
    throw new CustomError(403, errors.PERMISSION_DENIED);
  }
};

const isUserBlocked = (channel, userId) => {
  if (channel.blockUsers.some((u) => u.toString() === userId)) {
    throw new CustomError(403, errors.USER_BLOCKED);
  }
};

module.exports = {
  getChannelById,
  isChannelAdmin,
  isUserBlocked,
};
