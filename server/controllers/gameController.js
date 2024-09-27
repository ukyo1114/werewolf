const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { games } = require("../classes/GameState");
const { messages, errors } = require("../messages");

const checkGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const { gameId } = req.body;

  if (!gameId) return res.status(400).json({ error: errors.MISSING_DATA });

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });
  if (game.isProcessing) {
    return res.status(409).json({ error: errors.GAME_IS_PROCESSING});
  }

  req.playerId = playerId;
  req.game = game;
  req.players = game.players;
  req.phase = game.phase;
  next();
};

const getGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const gameId = req.params.gameId;

  if (!gameId) {
    return res.status(400).json({ error: errors.GAME_ID_MISSING });
  }

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

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

    if (!playerState) {
      return res.status(404).json({ error: errors.PLAYER_NOT_FOUND });
    }
  
    res.status(200).json(playerState);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const receiveVote = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  if (!selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  const vote = {
    voter: playerId,
    votee: selectedUser,
  };

  try {
    game.votes.receiveVote(vote, players, phase);
    res.status(200).json({ message: messages.VOTE_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_VOTE) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const receiveFortuneTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  if (!selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  try {
    game.fortune.receiveFortuneTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.FORTUNE_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_FORTUNE) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const receiveGuardTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  if (!selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  try {
    game.guard.receiveGuardTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.GUARD_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_GUARD) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const receiveAttackTarget = (req, res) => {
  const { playerId, game, players, phase } = req;
  const { selectedUser } = req.body;

  if (!selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  try {
    game.attack.receiveAttackTarget(playerId, selectedUser, players, phase);
    res.status(200).json({ message: messages.ATTACK_COMPLETED });
  } catch (error) {
    if (error.message === errors.INVALID_ATTACK) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const getVoteHistory = (req, res) => {
  const { game, phase } = req;

  try {
    const voteHistory = game.votes.getVoteHistory(phase);

    if (voteHistory === null) {
      return res.status(403).json({ error: errors.VOTE_HISTORY_NOT_FOUND });
    }

    res.status(200).json(voteHistory);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
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
      return res.status(403).json({ error: errors.FORTUNE_RESULT_NOT_FOUND });
    }

    res.status(200).json(fortuneResult);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const getMediumResult = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const mediumResult = game.medium.getMediumResult(playerId, players, phase);

    if (mediumResult === null) {
      return res.status(403).json({ error: errors.MEDIUM_RESULT_NOT_FOUND });
    }

    res.status(200).json(mediumResult);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const getGuardHistory = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const guardHistory = game.guard.getGuardHistory(playerId, players, phase);

    if (guardHistory === null) {
      return res.status(403).json({ error: errors.GUARD_HISTORY_NOT_FOUND });
    }

    res.status(200).json(guardHistory);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
  }
};

const getAttackHistory = (req, res) => {
  const { playerId, game, players, phase } = req;

  try {
    const attackHistory = game.attack.getAttackHistory(
      playerId,
      players,
      phase,
    );

    if (attackHistory === null) {
      return res.status(403).json({ error: errors.ATTACK_HISTORY_NOT_FOUND });
    }

    res.status(200).json(attackHistory);
  } catch (error) {
    res.status(500).json({ error: errors.SERVER_ERROR });
    console.error("error:", error.message);
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
