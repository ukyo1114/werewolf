const asyncHandler = require("express-async-handler");
const Game = require("./models/gameModel");

const createGame = asyncHandler(async () => {
  try {
    const game = await Game.create({
      channelName: ,
      description: ,
      users: [],
      channelAdmin: ,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = createGame;