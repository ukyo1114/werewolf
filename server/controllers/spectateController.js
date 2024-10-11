const { games } = require("../classes/GameState");
const { handleServerError } = require("../utils/handleError");

const getGameList = (req, res) => {
  const channelId = req.params.channelId;

  try {
    const gameList = getGamesByChannelId(channelId);
    res.status(200).json(gameList);
  } catch (error) {
    handleServerError(error);
  }
};

function getGamesByChannelId(channelId) {
  if (!games) return [];

  const allGames = Object.values(games);
  const filteredGames = allGames.filter((game) =>
    game.channelId === channelId
  );
  
  return createGameList(filteredGames);
};

function createGameList(games) {
  return games.map((game) => ({
    gameId: game.gameId,
    players: Array.from(game.players.keys()),
    currentDay: game.phase.currentDay,
    currentPhase: game.phase.currentPhase,
    result: game.result,
  }));
}

module.exports = getGameList;

// テスト済み