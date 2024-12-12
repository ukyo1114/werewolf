const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errors } = require("../messages");

const { gameEvents } = require("../classes/GameState");
const { games } = require("../controllers/gameControllers");

function gameNameSpaceHandler(io) {
  const gameNameSpace = io.of("/game");

  gameNameSpace.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error(errors.TOKEN_MISSING));
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id").lean();
      if (!user) return next(new Error(errors.USER_NOT_FOUND));
  
      next();
    } catch (error) {
      return next(new Error(errors.INVALID_TOKEN));
    }
  });

  gameNameSpace.on("connection", (socket) => {
    socket.on("joinGame", (gameId, callback) => {
      const game = games[gameId];
      if (!game) return callback({ gameState: null });
      
      const gameState = game.getGameState();
      socket.join(gameId);
      callback({ gameState });
    });
  });

  gameEvents.on("updateGameState", (gameState) => {
    const { gameId } = gameState;
    gameNameSpace.to(gameId).emit("updateGameState", gameState);
  });
}

module.exports = gameNameSpaceHandler;
