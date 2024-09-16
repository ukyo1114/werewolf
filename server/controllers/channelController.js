const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const EventEmitter = require("events");
const { populate } = require("dotenv");
const channelEvents = new EventEmitter();

const protect = async (req, res, next) => {
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
      return res
        .status(401)
        .json({ error: "トークンが見つからないようです。" });
    }
  }
  if (!token) {
    return res.status(401).json({ error: "トークンが見つからないようです。" });
  }
};

const fetchChannelList = async (req, res) => {
  try {
    const channels = await Channel.find({}).populate(
      "channelAdmin",
      "_id name pic",
    );
    const channelList = channels.map((channel) => {
      const { password, ...channelWithoutPass } = channel.toJSON({
        virtuals: true,
      });
      return channelWithoutPass;
    });
    res.status(200).json(channelList);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error("エラー:", error.message);
  }
};

const createChannel = async (req, res) => {
  if (!req.body.channelName || !req.body.description) {
    return res.status(400).json({ error: "未入力の項目があるようです。" });
  }
  try {
    const channel = await Channel.create({
      channelName: req.body.channelName,
      description: req.body.description,
      users: [req.user._id],
      channelAdmin: req.user._id,
      password: req.body.password,
      blockUser: [],
    });
    const fullChannel = await Channel.findById(channel._id)
      .select("-password")
      .populate("users", "_id name pic");
    res.status(200).json(fullChannel);
  } catch (error) {
    res.status(400).json({ error: "チャンネルの作成に失敗したようです。" });
    console.error("エラー:", error.message);
  }
};

const enterToChannel = async (req, res) => {
  const { channelId, password } = req.body;
  if (!channelId) {
    return res
      .status(400)
      .json({ error: "チャンネルが見つからないようです。" });
  }
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    }
    if (
      channel.blockUsers.some((u) => u.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ error: "ブロックされているようです。" });
    }
    if (
      !channel.users.some((u) => u.toString() === req.user._id.toString()) &&
      channel.password &&
      !(await channel.matchPassword(password))
    ) {
      return res.status(401).json({ error: "パスワードが無効のようです。" });
    }
    const fullChannel = await Channel.findByIdAndUpdate(
      channelId,
      { $addToSet: { users: req.user._id } },
      { new: true },
    )
      .select("-password")
      .populate("users", "_id name pic");
    if (!fullChannel) {
      return res
        .status(400)
        .json({ error: "チャンネルが見つからないようです。" });
    } else {
      res.json(fullChannel);
    }
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const leaveChannel = async (req, res) => {
  const { channelId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    if (channel.channelAdmin._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "チャンネルから退出できないようです。" });
    }
    const leaved = await Channel.findByIdAndUpdate(
      channelId,
      { $pull: { users: req.user._id } },
      { new: true },
    );
    if (!leaved) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    } else {
      const channelName = leaved.channelName;
      res.status(200).json({ message: `${channelName}から退出しました。` });
    }
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getBlockUserList = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .select("channelAdmin kickedUsers")
      .populate("blockUsers", "_id name pic");
    if (!channel) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    res.status(200).json(channel.blockUsers);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const block = async (req, res) => {
  const { channelId, selectedUser } = req.body;
  if (selectedUser === req.user._id.toString()) {
    return res.status(403).json({ error: "権限が無いようです。" });
  }
  try {
    const channel = await Channel.findById(channelId).select(
      "users channelAdmin blockUsers",
    );
    if (!channel) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    if (channel.blockUsers.some((user) => user.toString() === selectedUser)) {
      return res
        .status(400)
        .json({ error: "このユーザーは既にブロックされているようです。" });
    }
    channel.blockUsers.push(selectedUser);
    channel.users = channel.users.filter(
      (user) => user.toString() !== selectedUser,
    );
    await channel.save();
    const updatedChannel = await Channel.findById(channelId)
      .select("_id users blockUsers")
      .populate("blockUsers", "_id name pic");
    channelEvents.emit("blockUsers updated", {
      channelId: updatedChannel._id.toString(),
      blockUsers: updatedChannel.blockUsers.map((u) => u._id.toString()),
    });
    res.status(200).json(updatedChannel);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const cancelBlock = async (req, res) => {
  const { channelId, selectedBlockUser } = req.body;
  try {
    const channel = await Channel.findById(channelId)
      .select("channelAdmin blockUsers")
      .populate("blockUsers", "_id name pic");
    if (!channel) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    }
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "権限が無いようです。" });
    }
    if (
      channel.blockUsers.every(
        (user) => user._id.toString() !== selectedBlockUser,
      )
    ) {
      return res
        .status(400)
        .json({ error: "このユーザーはブロックされていないようです。" });
    }
    channel.blockUsers = channel.blockUsers.filter(
      (user) => user._id.toString() !== selectedBlockUser,
    );
    await channel.save();
    res.status(200).json(channel.blockUsers);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const userList = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId).populate(
      "users",
      "_id name pic",
    );
    if (!channel) {
      return res
        .status(404)
        .json({ error: "チャンネルが見つからないようです。" });
    }
    res.status(200).json(channel.users);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

module.exports = {
  protect,
  channelEvents,
  fetchChannelList,
  createChannel,
  enterToChannel,
  leaveChannel,
  userList,
  getBlockUserList,
  block,
  cancelBlock,
};
