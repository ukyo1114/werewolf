function chatNameSpaseHandler(io) {
  const chatNameSpace = io.of("/chat");

  chatNameSpace.on("connection", (socket) => {
    console.log("Connected to chatNameSpace !!");

    socket.on("join channel", (channelId) => {
      socket.join(channelId);
      console.log("Room joined: " + channelId);
    });

    socket.on("new message", (newMessageReceived) => {
      let channelId = newMessageReceived.channel;
      if (!channelId) return console.error("channelId not found !!");
      if (!newMessageReceived || !newMessageReceived.content) {
        return console.error("Invalid message format.");
      }
      socket.to(channelId).emit("message received", newMessageReceived);
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED !");
    });
  });
}

module.exports = chatNameSpaseHandler;