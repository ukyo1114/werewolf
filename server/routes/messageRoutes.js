const express = require("express");
const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Channel = require("../models/channelModels");
const asyncHandler = require("express-async-handler");

const router = express.Router();

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

const sendMessage = asyncHandler(async (req, res) => {
  const { content, channelId } = req.body;
  if (!content || !channelId) {
    console.log("Invalid Data Passed into Request");
    res.sendStatus(400);
  }
  const newMessage = {
    sender: req.user._id,
    content: content,
    channel: channelId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getMessages = asyncHandler(async (req, res) => {
  try {
    const { oldestMessageTimestamp } = req.query;
    console.log('oldestMessageTimestamp', oldestMessageTimestamp);
    const query = { channel: req.params.channelId };
    if (oldestMessageTimestamp) {
      query.createdAt = { $lt: new Date(oldestMessageTimestamp) };
    }
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name pic");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

router.post("/", protect, sendMessage);
router.get("/:channelId", protect, getMessages);

module.exports = router;
