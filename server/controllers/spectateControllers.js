const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { games } = require("./gameControllers");
const _ = require("lodash");

const getGameList = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const gameList = await getGamesByChannelId(channelId);
  res.status(200).json(gameList);
});

async function getGamesByChannelId(channelId) {
  if (!games) return [];
  const allGames = Object.values(games);
  const filteredGames = _.filter(allGames, { channelId });
  const gameList = await createGameList(filteredGames);

  return gameList;
};

async function createGameList(games) {
  const gameListPromises = games.map(async (game) => {
    const { gameId, result, phase } = game;
    const { currentDay, currentPhase } = phase;

    const playerIds = Array.from(game.players.players.keys());
    const players = await User.find({ _id: { $in: playerIds } })
      .populate("_id name pic");

    return { gameId, players, currentDay, currentPhase, result: result.value };
  });

  const gameList = await Promise.all(gameListPromises);
  return gameList;
}

module.exports = getGameList;