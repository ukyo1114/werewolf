const { errors } = require('../messages');
const CustomError = require('../classes/CustomError');
const { games } = require("../classes/GameState");

const getGameList = (req, res) => {
  const channelId = req.params.channelId;

  try {
    const gameList = getGamesByChannelId(channelId);
    res.status(200).json(gameList);
  } catch (error) {
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

function getGamesByChannelId(channelId) {
  if (!games) return [];

  const allGames = Object.values(games);
  const filteredGames = allGames.filter((game) =>
    game.channelId === channelId
  );

  const gameList = filteredGames.map((game) => ({
    gameId: game.gameId,
    players: game.players.map((pl) => pl._id),
    currentDay: game.phase.currentDay,
    currentPhase: game.phase.currentPhase,
    result: game.result,
  }));

  return gameList;
};

module.exports = getGameList;