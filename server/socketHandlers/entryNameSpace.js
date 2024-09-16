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
      if (!entryUsers[channelId].entryNameSpace) {
        entryUsers[channelId].entryNameSpace = entryNameSpace;
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
        checkAndDeleteEmptyChannel(channelId);
      }
    });

    function checkAndDeleteEmptyChannel(channelId) {
      const room = entryNameSpace.adapter.rooms.get(channelId);
      if (!room || room.size === 0) {
        delete entryUsers[channelId];
        console.log(`Deleted empty channel: ${channelId}`);
      }
    }
  });

  entryEvents.on("entry update", (data) => {
    const { channelId, userList } = data;
    try {
      entryNameSpace.to(channelId).emit("entry update", userList);
    } catch (error) {
      console.error(
        "エントリーを更新する通知に失敗したようです。",
        error.message,
      );
    }
  });

  entryEvents.on("game start", (data) => {
    const { socketIds, fullGame } = data;
    try {
      socketIds.forEach((socketId) => {
        entryNameSpace.to(socketId).emit("game start", fullGame);
      });
    } catch (error) {
      console.error("ゲームを作成する通知に失敗したようです。", error.message);
    }
  });

  entryEvents.on("game error", (data) => {
    const { channelId } = data;
    try {
      entryNameSpace.to(channelId).emit("game error", data);
    } catch (error) {
      console.error(
        "ゲーム作成エラーの通知に失敗したようです。",
        error.message,
      );
    }
  });
}

module.exports = entryNameSpaseHandler;
