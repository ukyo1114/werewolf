const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Channel = require("../models/channelModel");
const { channelEvents } = require("../controllers/channelController");

function chatNameSpaseHandler(io) {
  const chatNameSpace = io.of("/chat");

  chatNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select("_id");
      console.log(socket.user._id);
      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  chatNameSpace.on("connection", (socket) => {
    console.log("Connected to chatNameSpace !!");
    socket.on("join channel", async (channelId) => {
      socket.join(channelId);
      socket.channelId = channelId;
    });

    socket.on("new message", (newMessageReceived) => {
      let channelId = newMessageReceived.channel;
      if (!channelId) return console.error("channelId not found !!");
      if (!newMessageReceived || !newMessageReceived.content) {
        return console.error("Invalid message format.");
      }
      chatNameSpace.to(channelId).emit("message received", newMessageReceived);
    });

    socket.on("disconnect", async () => {
      console.log("USER DISCONNECTED !");
    });
  });

  channelEvents.on("user added", (data) => {
    const { channelId, user } = data;
    chatNameSpace.to(channelId).emit("user added", user);
  });

  channelEvents.on("user left", (data) => {
    const { channelId, userId } = data;
    chatNameSpace.to(channelId).emit("user left", userId);
  });

  channelEvents.on("add blockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("add blockUser", blockUser);
  });

  channelEvents.on("cancel blockUser", (data) => {
    const { channelId, blockUser } = data;
    chatNameSpace.to(channelId).emit("cancel blockUser", blockUser);
  })
}

module.exports = chatNameSpaseHandler;
