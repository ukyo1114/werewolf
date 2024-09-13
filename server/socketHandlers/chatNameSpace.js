const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Channel = require("../models/channelModel");
const { channelEvents } = require("../routes/channelRoutes");

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
      return next (new Error("Authentication error"));
    }
  });

  chatNameSpace.on("connection", (socket) => {
    console.log("Connected to chatNameSpace !!");
    socket.on("join channel", async (channelId) => {
      socket.join(channelId);
      socket.channelId = channelId;
      try {
        const user = await User.findById(socket.user._id).select("_id name pic");
        socket.to(channelId).emit("user joined", user);
        // console.log("Room joined: " + channelId);
      } catch (error) {
        console.error("Error while joining channel", error);
      }
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
      const channelId = socket.channelId;
      if (channelId) {
        try {
          const channel = await Channel.findById(channelId).select("users");
          if (channel) {
            socket.to(channelId).emit("update users", channel.users);
          } else {
            console.error(`Channel with ID ${channelId} not found.`); //ゲーム中の挙動に注意
          }
        } catch (error) {
          console.error(`Error updating users for channel ${channelId}`);
        }
      }
      console.log("USER DISCONNECTED !");
    });
  });

  channelEvents.on("blockUsers updated", (data) => {
    const { channelId, blockUsers } = data;
    chatNameSpace.to(channelId).emit("update blockUsers", blockUsers);
  });
}

module.exports = chatNameSpaseHandler;