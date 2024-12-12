const Channel = require("../models/channelModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");

const isUserAdmin = async (channelId, userId) =>  {
  const channel = await Channel.findById(channelId)
    .select("channelAdmin")
    .lean();
  if (!channel) throw new CustomError(404, errors.CHANNEL_NOT_FOUND);

  const isChAdmin = channel.channelAdmin.toString() === userId;

  return { isChAdmin };
};

module.exports = { isUserAdmin };
