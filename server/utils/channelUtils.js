const Channel = require("../models/channelModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");

const getChannelById = async (channelId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);

  return channel;
};

const isUserAdmin = async (channelId, userId) =>  {
  const channel = await Channel.findById(channelId)
    .select("channelAdmin")
    .lean();
  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);

  const isChAdmin = channel.channelAdmin.toString() === userId;
  if (!isChAdmin) throw new CustomError(403, errors.PERMISSION_DENIED);

  return isChAdmin;
};

module.exports = { getChannelById, isUserAdmin };
