const asyncHandler = require("express-async-handler");
const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const EventEmitter = require('events');
const channelEvents = new EventEmitter();

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized, Token Failed !");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, Token Failed !");
  }
});

const fetchChannelList = asyncHandler(async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate("channelAdmin", "_id name pic");
    const channelList = channels.map(channel => {
      const { password, ...channelWithoutPass } = channel.toJSON({ virtuals: true });
      return channelWithoutPass;
    });
    res.status(200).json(channelList);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createChannel = asyncHandler(async (req, res) => {
  if (!req.body.channelName || !req.body.description) {
    return res.status(400).send({ message: "Please Fill All The Details ! " });
  }
  try {
    const channel = await Channel.create({
      channelName: req.body.channelName,
      description: req.body.description,
      users: [req.user._id],
      channelAdmin: req.user,
      password: req.body.password,
      blockUser: [],
    });
    const fullChannel = await Channel.findById(channel._id).select("-password")
      .populate("users", "_id name pic");
    res.status(200).json(fullChannel);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/* const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(400);
    throw new Error("Chat Not Found !");
  } else {
    res.json(updatedChat);
  }
}); */

const enterToChannel = asyncHandler(async (req, res) => {
  const { channelId, password } = req.body;
  if (!channelId) {
    res.status(400);
    throw new Error("Channel ID is required");
  }
  const channel = await Channel.findById(channelId);
  if (!channel) {
    res.status(404);
    throw new Error("チャンネルが見つからないようです。");
  }
  if (channel.blockUsers.some(u => u.toString() === req.user._id.toString())) {
    return res.status(403).json({ error: "ブロックされているようです。" });
  }
  if (
    !channel.users.some(u => u.toString() === req.user._id.toString()) &&
    channel.password &&
    !(await channel.matchPassword(password))
  ) {
    return res.status(401).json({ error: "パスワードが無効のようです。" });
  }
  const fullChannel = await Channel.findByIdAndUpdate(
    channelId,
    { $addToSet: { users: req.user._id } },
    { new: true }
  )
    .select("-password")
    .populate("users", "_id name pic");
  if (!fullChannel) {
    res.status(400);
    throw new Error("チャンネルが見つからないようです。");
  } else {
    res.json(fullChannel);
  }
});

const leaveChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  const channel = await Channel.findById(channelId);
  if (channel.channelAdmin._id.toString() === req.user._id.toString()){
    res.status(400);
    throw new Error("Failed leave channel");
  }
  const leaved = await Channel.findByIdAndUpdate(
    channelId,
    { $pull: { users: req.user._id } },
    { new: true }
  )
  if (!leaved) {
    res.status(400);
    throw new Error("Channel Not Found");
  } else {
    res.json(leaved);
  }
});

const getBlockedUserList = async(req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .select("channelAdmin kickedUsers")
      .populate("blockUsers", "_id name pic");
      if (!channel) {
        return res.status(404).json({ error: "チャンネルが見つからないようです。" });
      }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    res.status(200).json(channel.blockUsers);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
  }
}

const block = async(req, res) => {
  const { channelId, selectedUser } = req.body;
  if (selectedUser === req.user._id.toString()) {
    return res.status(403).json({ error: "権限が無いようです。" });
  }
  try {
    const channel = await Channel.findById(channelId)
      .select("users channelAdmin blockUsers");
    if (!channel) {
      return res.status(404).json({ error: "チャンネルが見つからないようです。" });
    }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    if (channel.blockUsers.some(user => user.toString() === selectedUser)) {
      return res.status(400).json({ error: "このユーザーは既にブロックされているようです。"});
    }
    channel.blockUsers.push(selectedUser);
    channel.users = channel.users.filter(user => user.toString() !== selectedUser);
    await channel.save();
    const updatedChannel = await Channel.findById(channelId)
      .select("_id users blockUsers")
      .populate("blockUsers", "_id name pic");
    channelEvents.emit("blockUsers updated",
      {
        channelId: updatedChannel._id.toString(),
        blockUsers: updatedChannel.blockUsers.map(u => u._id.toString())
      }
    );
    res.status(200).json(updatedChannel);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。"});
  }
}

const cancelBlock = async(req, res) => {
  const { channelId, selectedBlockUser } = req.body;
  try {
    const channel = await Channel.findById(channelId)
      .select("channelAdmin blockUsers")
      .populate("blockUsers", "_id name pic");
    if (!channel) {
      return res.status(404).json({ error: "チャンネルが見つからないようです。" });
    }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    if (channel.blockUsers.every(user => user._id.toString() !== selectedBlockUser)) {
      return res.status(400).json({ error: "このユーザーはブロックされていないようです。" });
    }
    channel.blockUsers = channel.blockUsers.filter(
      user => user._id.toString() !== selectedBlockUser
    );
    await channel.save();
    res.status(200).json(channel.blockUsers);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
  }
}

const userList = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.channelId)
    .populate("users", "_id name pic");

  if (!channel) {
    res.status(404);
    throw new Error("Channel not found");
  }

  res.status(200).json(channel.users);
});

router.get("/", protect, fetchChannelList);
router.post("/createchannel", protect, createChannel);
router.put("/channelenter", protect, enterToChannel);
router.put("/leaveChannel", protect, leaveChannel);
router.get("/:channelId", protect, userList);
router.get("/getblockeduserlist/:channelId", protect, getBlockedUserList);
router.post("/block", protect, block);
router.post("/cancelblock", protect, cancelBlock);
router.get("/:channelId", protect, userList);

module.exports = { router, channelEvents };
