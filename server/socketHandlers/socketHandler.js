const socketIo = require("socket.io");
const { chatNameSpaseHandler } = require("./chatNameSpace");
const entryNameSpaseHandler = require("./entryNameSpace");
const gameNameSpaseHandler = require("./gameNameSpace");

function socketHandler(server) {
  const io = socketIo(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
    },
  });

  chatNameSpaseHandler(io);
  entryNameSpaseHandler(io);
  gameNameSpaseHandler(io);
}

module.exports = socketHandler;
