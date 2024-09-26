const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errors } = require("../messages");

const { games, gameEvents } = require("../classes/GameState");

function gameNameSpaceHandler(io) {
  const gameNameSpace = io.of("/game");

  gameNameSpace.use(async (socket, next) => {
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
