const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errors } = require("../messages");

const { Entry, entryUsers, entryEvents } = require("../classes/Entry");

function entryNameSpaseHandler(io) {
  const entryNameSpace = io.of("/entry");

  entryNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
  
    if (!token) {
      return next(new Error(errors.TOKEN_MISSING));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id");
  
      if (!user) {
        return next(new Error(errors.USER_NOT_FOUND));
      }
  
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error(errors.INVALID_TOKEN));
    }
  });

  entryNameSpace.on("connection", (socket) => {
    socket.on("joinChannel", (channelId, callback) => {
      socket.join(channelId);
      socket.channelId = channelId;

      if (!entryUsers[channelId]) entryUsers[channelId] = new Entry(channelId);

      callback({
        users: entryUsers[channelId].userList(),
      });
    });

    socket.on("registerEntry", () => {
      const userId = socket.user._id.toString();
      const channelId = socket.channelId;

      if (entryUsers[channelId]) {
        entryUsers[channelId].register(socket.id, userId);
      }
    });

    socket.on("cancelEntry", () => {
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

  entryEvents.on("entryUpdate", (data) => {
    const { channelId, userList } = data;
    entryNameSpace.to(channelId).emit("entryUpdate", userList);
  });

  entryEvents.on("gameStart", (data) => {
    const { socketIds, fullGame } = data;

    socketIds.forEach((socketId) => {
      entryNameSpace.to(socketId).emit("gameStart", fullGame);
    });
  });

  entryEvents.on("gameCreationFailed", (data) => {
    const { channelId } = data;

    entryNameSpace.to(channelId).emit("gameCreationFailed", {
      error: errors.GAME_CREATION_FAILED,
    });
  });
}

module.exports = entryNameSpaseHandler;
