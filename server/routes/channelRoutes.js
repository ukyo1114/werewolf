const asyncHandler = require("express-async-handler");
const Channel = require("../models/channelModels");
const User = require("../models/userModel");
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
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

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId Param Not Sent With Request !");
    return res.sendStatus(400);
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChannelList = asyncHandler(async (req, res) => {
  try {
    const results = await Channel.find({})
      .populate('channelAdmin', 'name');

      res.status(200).send(results);
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
      users: [req.user],
      channelAdmin: req.user,
    });
    const fullChannel = await Channel.findOne({ _id: channel._id })
      .populate('channelAdmin', 'name');

    res.status(200).json(fullChannel);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
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
});

const addToChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.body;
  const channel = await Channel.findByIdAndUpdate(
    channelId,
    { $push: { users: req.user } },
    { new: true }
  )
  
  if (!channel) {
    res.status(400);
    throw new Error('Channel Not Found');
  } else {
    res.json(channel);
  }
});

const leaveChannel = asyncHandler(async (req, res) => {
  const { channel } = req.body;
  if (channel.channelAdmin._id === req.user._id.toString()){
    res.status(400);
    throw new Error("Failed leave channel");
  }
  const channelId = channel._id;
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

const userList = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.channelId)
    .populate('users', '_id name pic');

  if (!channel) {
    res.status(404);
    throw new Error('Channel not found');
  }

  res.status(200).json(channel.users);
});

router.post('/', protect, accessChat);
router.get('/', protect, fetchChannelList);
router.post('/createchannel', protect, createChannel);
router.put('/rename', protect, renameGroup);
router.put('/channeladd', protect, addToChannel);
router.put('/leaveChannel', protect, leaveChannel);
router.get('/:channelId', protect, userList);

module.exports = router;
