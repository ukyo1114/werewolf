const { Entry, entryUsers } = require("../classes/entry");

function entryNameSpaseHandler(io) {
  const entryNameSpace = io.of("/entry");

  entryNameSpace.on("connection", (socket) => {
    socket.on("join channel", (channelId, callback) => {
      socket.join(channelId);
      socket.channelId = channelId;
      if (!entryUsers[channelId]) {
        entryUsers[channelId] = new Entry(channelId, entryNameSpace);
      }
      if (!entryUsers[channelId].entryNameSpace) {
        entryUsers[channelId].entryNameSpace = entryNameSpace;
      }
      callback({
        users: entryUsers[channelId].userList()
      });
    });
  
    socket.on("register entry", async (user) => {
      const channelId = socket.channelId;
      if (entryUsers[channelId]) {
        entryUsers[channelId].register(socket.id, user);
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
}

module.exports = entryNameSpaseHandler;