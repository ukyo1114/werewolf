const { games } = require("../classes/gameState");

function gameNameSpaceHandler(io) {
  const gameNameSpace = io.of("/game");

  gameNameSpace.on("connection", (socket) => {
    socket.on("join game", (gameId, callback) => {
      if (games[gameId]) {
        socket.join(gameId);
        if (!games[gameId].gameNameSpace) {
          games[gameId].gameNameSpace = gameNameSpace;
        }
        const gameState = games[gameId].getGameState();
        callback({
          gameState: gameState,
        });
      } else {
        callback({
          gameState: null,
        });
      }
    });
  });
}

module.exports = gameNameSpaceHandler;