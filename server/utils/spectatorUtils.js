const { games } = require("../classes/GameState");

const getGamesByChannelId = (channelId) => {
  if (!games) return [];

  const allGames = Object.values(games);
  const filteredGames = allGames.filter((game) =>
    game.channelId === channelId
  );

  const gameList = filteredGames.map((game) => {
    return {
      gameId: game.gameId,
      players: game.players.map((pl) => pl._id),
      currentDay: game.phase.currentDay,
      currentPhase: game.phase.currentPhase,
      result: game.result,
    };
  });

  return gameList;
};

module.exports = getGamesByChannelId;