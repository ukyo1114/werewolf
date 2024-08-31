const socketIo = require("socket.io");
const chatNameSpaseHandler = require("./chatNameSpace");
const entryNameSpaseHandler = require("./entryNameSpace");

function socketHandler(server) {
  const io = socketIo(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  chatNameSpaseHandler(io);
  entryNameSpaseHandler(io);
}

module.exports = socketHandler;
