const Channel = require("../models/channelModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const EventEmitter = require("events");
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
      return next();
    } catch (error) {
      return res.status(401);
    }
  }
  if (!token) return res.status(401);
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
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const createChannel = async (req, res) => {
  if (!req.body.channelName || !req.body.description) {
    return res.status(400);
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
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const channelSettings = async (req, res) => {
  const { channelId, channelName, description, password } = req.body;

  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404);
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403);
    }
    if (channelName) channel.channelName = channelName;
    if (description) channel.description = description;
    if (password !== undefined) channel.password = password;

    await channel.save();
    const channelWithoutPass = await Channel.findById(channel._id.toString())
      .select("-password");
    res.status(200).json(channelWithoutPass);
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const enterToChannel = async (req, res) => {
  const { channelId, password } = req.body;
  const userId = req.user._id.toString();
  if (!channelId) return res.status(400);
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404);
    if (
      channel.blockUsers.some((u) => u.toString() === req.user._id.toString())
    ) return res.status(403);
    if (
      !channel.users.some((u) => u.toString() === req.user._id.toString()) &&
      channel.password &&
      !(await channel.matchPassword(password))
    ) return res.status(401).json({ error: "パスワードが間違っているようです。" });

    const fullChannel = await Channel.findByIdAndUpdate(
      channelId,
      { $addToSet: { users: req.user._id } },
      { new: true },
    )
      .select("-password")
      .populate("users", "_id name pic");
    if (!fullChannel) {
      return res.status(400);
    } else {
      const user = await User.findById(userId).select("_id name pic");
      if (user) {
        channelEvents.emit("user added", {
          channelId: channelId,
          user: user,
        }); 
      }
      res.json(fullChannel);
    }
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const leaveChannel = async (req, res) => {
  const { channelId } = req.body;
  const userId = req.user._id.toString();
  if (!channelId) return res.status(400);
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404);
    if (channel.channelAdmin.toString() === req.user._id.toString()) {
      return res.status(400);
    }
    const leaved = await Channel.findByIdAndUpdate(
      channelId,
      { $pull: { users: userId } },
      { new: true },
    );
    if (!leaved) {
      return res.status(404);
    } else {
      const channelName = leaved.channelName;
      channelEvents.emit("user left", {
        channelId: channelId,
        userId: userId,
      });
      res.status(200).json({ message: `${channelName}から退出しました。` });
    }
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const getBlockUserList = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .select("channelAdmin blockUsers")
      .populate("blockUsers", "_id name pic");
    if (!channel) return res.status(404);
    if (channel.channelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403);
    }
    res.status(200).json(channel.blockUsers);
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const block = async (req, res) => {
  const { channelId, selectedUser } = req.body;
  const userId = req.user._id.toString();
  if (!channelId) return res.status(400);
  if (selectedUser === userId) return res.status(403);
  try {
    const channel = await Channel.findById(channelId).select(
      "users channelAdmin blockUsers",
    );
    if (!channel) return res.status(404);
    if (channel.channelAdmin.toString() !== userId) {
      return res.status(403);
    }
    if (channel.blockUsers.some((u) => u.toString() === selectedUser)) {
      return res.status(400);
    }
    channel.blockUsers.push(selectedUser);
    channel.users = channel.users.filter((u) => u.toString() !== selectedUser,);
    await channel.save();
    const updatedChannel = await Channel.findById(channelId)
      .select("_id users blockUsers");
    if (!updatedChannel) {
      return res.status(400);
    } else {
      channelEvents.emit("add blockUser", {
        channelId: updatedChannel._id.toString(),
        blockUser: selectedUser,
      });
    }
    res.status(200).json(selectedUser);
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const cancelBlock = async (req, res) => {
  const { channelId, selectedBlockUser } = req.body;
  const userId = req.user._id.toString();
  try {
    const channel = await Channel.findById(channelId)
      .select("channelAdmin blockUsers");
    if (!channel) return res.status(404);
    if (channel.channelAdmin.toString() !== userId) {
      return res.status(403);
    }
    if (
      channel.blockUsers.every(
        (user) => user.toString() !== selectedBlockUser,
      )
    ) return res.status(400);
    channel.blockUsers = channel.blockUsers.filter(
      (user) => user.toString() !== selectedBlockUser,
    );
    await channel.save();
    channelEvents.emit("cancel blockUser", {
      channelId: channelId,
      blockUser: selectedBlockUser,
    });
    res.status(200).json(channel.blockUsers.map((user) => user.toString()));
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const userList = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate("users","_id name pic");
    if (!channel) return res.status(404);
    res.status(200).json(channel.users);
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

module.exports = {
  protect,
  channelEvents,
  fetchChannelList,
  createChannel,
  channelSettings,
  enterToChannel,
  leaveChannel,
  userList,
  getBlockUserList,
  block,
  cancelBlock,
};
