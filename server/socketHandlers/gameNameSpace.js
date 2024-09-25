const { games, gameEvents } = require("../classes/GameState");

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

  gameEvents.on("update game state", (gameState) => {
    const { gameId } = gameState;
    try {
      gameNameSpace.to(gameId).emit("update game state", gameState);
    } catch (error) {
      console.error("gameStateの通知に失敗したようです。", error.message);
    }
  });
}

module.exports = gameNameSpaceHandler;
