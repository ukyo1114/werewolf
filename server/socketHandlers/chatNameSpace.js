const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { errors } = require("../messages");
const { getIdType } = require("../utils/messageUtils");

const { channelEvents } = require("../controllers/channelController");

function chatNameSpaseHandler(io) {
  const chatNameSpace = io.of("/chat");
  const userSocketMap = {};

  chatNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error(errors.TOKEN_MISSING));
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id").lean();
      if (!user) return next(new Error(errors.USER_NOT_FOUND));
  
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      return next(new Error(errors.INVALID_TOKEN));
    }
  });

  chatNameSpace.on("connection", (socket) => {
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    socket.on("joinChannel", async (channelId, callback) => {
      try {
        const { type, gameExists } = await getIdType(channelId);
        if (type === "game" && !gameExists) {
          return callback({
            success: false,
            err: errors.CHANNEL_ACCESS_FORBIDDEN,
          });
        }

        socket.join(channelId);
        socket.channelId = channelId;

        callback({ success: true });
      } catch (err) {
        callback({
          success: false,
          err: "An unexpected error occurred.",
        });
      }
    });

    socket.on("disconnect", async () => {
      delete userSocketMap[userId];
    });
  });

  channelEvents.on("newMessage", (message, users) => {
    const { channel, messageType } = message;
    const channelId = channel.toString();

    if (messageType === "normal") {
      chatNameSpace.to(channelId).emit("messageReceived", message);
    } else {
      users.forEach((userId) => {
        const socketId = userSocketMap[userId];
        chatNameSpace.to(socketId).emit("messageReceived", message);
      });
    }
  });

  channelEvents.on("cSettingsChanged", (data) => {
    const { channelId, updatedChannel } = data;
    chatNameSpace.to(channelId).emit("cSettingsChanged", updatedChannel);
  });

  channelEvents.on("userJoined", (data) => {
    const { channelId, user } = data;
    chatNameSpace.to(channelId).emit("userJoined", user);
  });

  channelEvents.on("userLeft", (data) => {
    const { channelId, userId } = data;
    chatNameSpace.to(channelId).emit("userLeft", userId);
  });

  channelEvents.on("registerBlockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("registerBlockUser", blockUser);
  });

  channelEvents.on("cancelBlockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("cancelBlockUser", blockUser);
  })

  // userEvents.on("profileUpdated", (user) => { });
}

module.exports = { chatNameSpaseHandler };
