const asyncHandler = require("express-async-handler");

const Channel = require("../models/channelModel");
const { channelEvents } = require("./channelControllers");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const { isUserAdmin } = require("../utils/channelUtils");

const getBlockUsers = asyncHandler(async (req, res) => {
  const { params: { channelId }, userId } = req;

  await isUserAdmin(channelId, userId);

  const { blockUsers } = await Channel.findById(channelId)
    .select("blockUsers")
    .populate("blockUsers", "_id name pic")
    .lean();

  res.status(200).json({ blockUsers }); // client側の実装を確認
});

const registerBlock = asyncHandler(async (req, res) => {
  const { body: { channelId, selectedUser }, userId } = req;
  
  if (selectedUser === userId) throw new CustomError(403, errors.SELF_BLOCK);

  await isUserAdmin(channelId, userId);

  await Channel.updateOne(
    { _id: channelId },
    {
      $addToSet: { blockUsers: selectedUser },
      $pull: { users: selectedUser }
    }
  );

  channelEvents.emit("registerBlockUser", { channelId, blockUser: selectedUser });

  res.status(200).send(); // client側の実装を確認
});

const cancelBlock = asyncHandler(async (req, res) => {
  const { body: { channelId, selectedBUser }, userId } = req; // client側の実装を確認

  await isUserAdmin(channelId, userId);

  await Channel.findByIdAndUpdate(
    channelId, { $pull: { blockUsers: selectedBUser } }
  );

  channelEvents.emit(
    "cancelBlockUser", { channelId, blockUser: selectedBUser }
  );

  res.status(200).send(); // client側の実装を確認
});

module.exports = {
  getBlockUsers,
  registerBlock,
  cancelBlock,
};