const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errors } = require("../messages");
const Channel = require("../models/channelModel");
const EventEmitter = require('events');
const channelEvents = new EventEmitter();
const { userEvents } = require("../controllers/userController");

function chatNameSpaseHandler(io) {
  const chatNameSpace = io.of("/chat");
  const userSocketMap = {};

  chatNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
  
    if (!token) {
      return next(new Error(errors.TOKEN_MISSING));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id");
  
      if (!user) return next(new Error(errors.USER_NOT_FOUND));
  
      socket.user = user._id.toString();
      next();
    } catch (error) {
      return next(new Error(errors.INVALID_TOKEN));
    }
  });

  chatNameSpace.on("connection", (socket) => {
    console.log("Connected to chatNameSpace !!");
    const userId = socket.user;
    userSocketMap[userId] = socket.id;

    socket.on("join channel", async (channelId) => {
      socket.join(channelId);
      socket.channelId = channelId;
    });

    socket.on("disconnect", async () => {
      console.log("USER DISCONNECTED !");
      delete userSocketMap[userId];
    });
  });

  channelEvents.on("newMessage", (message, users) => {
    const { channel, messageType } = message;
    const channelId = channel.toString();
    console.log("messageType", messageType, "users", users);

    if (messageType === "normal") {
      chatNameSpace.to(channelId).emit("messageReceived", message);
    } else {
      users.forEach((userId) => {
        const socketId = userSocketMap[userId];
        chatNameSpace.to(socketId).emit("messageReceived", message);
      });
    }
  });

  channelEvents.on("user added", (data) => {
    const { channelId, user } = data;
    chatNameSpace.to(channelId).emit("user added", user);
  });

  channelEvents.on("user left", (data) => {
    const { channelId, userId } = data;
    chatNameSpace.to(channelId).emit("user left", userId);
  });

  channelEvents.on("registerBlockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("registerBlockUser", blockUser);
  });

  channelEvents.on("cancelBlockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("cancelBlockUser", blockUser);
  })
/* 
  userEvents.on("profileUpdated", (user) => {
    // チャンネルをカプセル化したあとでいじる～
  }); */
}

module.exports = { chatNameSpaseHandler, channelEvents };
