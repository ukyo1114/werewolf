const { games, gameEvents } = require("../classes/GameState");

function gameNameSpaceHandler(io) {
  const gameNameSpace = io.of("/game");

  gameNameSpace.on("connection", (socket) => {
    socket.on("joinGame", (gameId, callback) => {
      if (!games[gameId]) return callback({ gameState : null });

      socket.join(gameId);
      const gameState = games[gameId].getGameState();

      callback({ gameState: gameState });
    });
  });

  gameEvents.on("updateGameState", (gameState) => {
    const { gameId } = gameState;
    gameNameSpace.to(gameId).emit("updateGameState", gameState);
  });
}

module.exports = gameNameSpaceHandler;
