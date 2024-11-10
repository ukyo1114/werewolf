const socketIo = require("socket.io");
const { chatNameSpaseHandler } = require("./chatNameSpace");
const entryNameSpaseHandler = require("./entryNameSpace");
const gameNameSpaseHandler = require("./gameNameSpace");

function socketHandler(server) {
  const io = socketIo(server, {
    pingTimeout: 60000,
    cors: process.env.NODE_ENV === 'development' ? {
      origin: "http://localhost:5173",
    } : undefined,
  });

  chatNameSpaseHandler(io);
  entryNameSpaseHandler(io);
  gameNameSpaseHandler(io);
}

module.exports = socketHandler;
