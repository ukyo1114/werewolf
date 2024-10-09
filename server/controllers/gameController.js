const { games } = require("../classes/GameState");
const { messages, errors } = require("../messages");
const CustomError = require('../classes/CustomError');

const checkGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const { gameId } = req.body;
  const game = games[gameId];

  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);
  if (game.isProcessing) throw new CustomError(409, errors.GAME_IS_PROCESSING);

  req.playerId = playerId;
  req.game = game;
  req.players = game.players;
  req.phase = game.phase;
  next();
};

const getGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const gameId = req.params.gameId;
  const game = games[gameId];

  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);

  req.playerId = playerId;
  req.game = game;
  req.players = game.players;
  req.phase = game.phase;
  next();
};

const getPlayerState = (req, res) => {
  const { playerId, players } = req;

  try {
    const playerState = players.getPlayerState(playerId);

    if (!playerState) throw new CustomError(404, errors.PLAYER_NOT_FOUND);
  
    res.status(200).json(playerState);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const receiveVote = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;
  const vote = {
    voter: playerId,
    votee: selectedUser,
  };

  try {
    game.votes.receiveVote(vote, players, phase);
    res.status(200).json({ message: messages.VOTE_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_VOTE) {
      throw new CustomError(400, error.message);
    }

    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const receiveFortuneTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  try {
    game.fortune.receiveFortuneTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.FORTUNE_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_FORTUNE) {
      throw new CustomError(400, error.message);
    }

    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const receiveGuardTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  try {
    game.guard.receiveGuardTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.GUARD_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_GUARD) {
      throw new CustomError(400, error.message);
    }

    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const receiveAttackTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  try {
    game.attack.receiveAttackTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.ATTACK_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_ATTACK) {
      throw new CustomError(400, error.message);
    }

    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getVoteHistory = (req, res) => {
  const { game, phase } = req;

  try {
    const voteHistory = game.votes.getVoteHistory(phase);

    if (voteHistory === null) {
      throw new CustomError(403, errors.VOTE_HISTORY_NOT_FOUND);
    }

    res.status(200).json(voteHistory);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getFortuneResult = (req, res) => {
  const { playerId, game, players, phase } = req;

  try{  
    const fortuneResult = game.fortune.getFortuneResult(
      playerId,
      players,
      phase,
    );

    if (fortuneResult === null) {
      throw new CustomError(403, errors.FORTUNE_RESULT_NOT_FOUND);
    }

    res.status(200).json(fortuneResult);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getMediumResult = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const mediumResult = game.medium.getMediumResult(playerId, players, phase);

    if (mediumResult === null) {
      throw new CustomError(403, errors.MEDIUM_RESULT_NOT_FOUND);
    }

    res.status(200).json(mediumResult);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getGuardHistory = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const guardHistory = game.guard.getGuardHistory(playerId, players, phase);

    if (guardHistory === null) {
      throw new CustomError(403, errors.GUARD_HISTORY_NOT_FOUND);
    }

    res.status(200).json(guardHistory);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getAttackHistory = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const attackHistory = game.attack.getAttackHistory(
      playerId, players, phase
    );

    if (attackHistory === null) {
      throw new CustomError(403, errors.ATTACK_HISTORY_NOT_FOUND);
    }

    res.status(200).json(attackHistory);
  } catch (error) {
    console.error("error:", error.message);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

module.exports = {
  checkGame,
  getGame,
  getPlayerState,
  receiveVote,
  receiveFortuneTarget,
  receiveGuardTarget,
  receiveAttackTarget,
  getVoteHistory,
  getFortuneResult,
  getMediumResult,
  getGuardHistory,
  getAttackHistory,
};
