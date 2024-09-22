const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const { Entry, entryUsers, entryEvents } = require("../classes/entry");

function entryNameSpaseHandler(io) {
  const entryNameSpace = io.of("/entry");

  entryNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select("_id");
      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  entryNameSpace.on("connection", (socket) => {
    socket.on("join channel", (channelId, callback) => {
      socket.join(channelId);
      socket.channelId = channelId;
      if (!entryUsers[channelId]) {
        entryUsers[channelId] = new Entry(channelId);
      }
      callback({
        users: entryUsers[channelId].userList(),
      });
    });

    socket.on("register entry", () => {
      const userId = socket.user._id.toString();
      const channelId = socket.channelId;
      if (entryUsers[channelId]) {
        entryUsers[channelId].register(socket.id, userId);
      }
    });

    socket.on("cancel entry", () => {
      const channelId = socket.channelId;
      if (entryUsers[channelId]) {
        entryUsers[channelId].cancel(socket.id);
      }
    });

    socket.on("disconnect", () => {
      const channelId = socket.channelId;
      if (channelId && entryUsers[channelId]) {
        entryUsers[channelId].cancel(socket.id);
      }
    });
  });

  entryEvents.on("entry update", (data) => {
    const { channelId, userList } = data;
    try {
      entryNameSpace.to(channelId).emit("entry update", userList);
    } catch (error) {
      console.error(error.message);
    }
  });

  entryEvents.on("game start", (data) => {
    const { socketIds, fullGame } = data;
    try {
      socketIds.forEach((socketId) => {
        entryNameSpace.to(socketId).emit("game start", fullGame);
      });
    } catch (error) {
      console.error(error.message);
    }
  });

  entryEvents.on("game error", (data) => {
    const { channelId } = data;
    try {
      entryNameSpace.to(channelId).emit("game error", data);
    } catch (error) {
      console.error(error.message);
    }
  });
}

module.exports = entryNameSpaseHandler;
