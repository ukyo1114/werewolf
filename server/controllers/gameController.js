const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { games } = require("../classes/GameState");
const { messages, errors } = require("../messages");

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || header.startsWith("Bearer")) {
    return res.status(401).json({ error: errors.TOKEN_MISSING });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id");

    if (!user) res.status(401).json({ error: errors.USER_NOT_FOUND});

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: errors.INVALID_TOKEN});
  }
};

const getPlayerState = (req, res) => {
  const playerId = req.user._id.toString();
  const gameId = req.params.gameId;

  if (!gameId) return res.status(400).json({ error: errors.GAME_ID_MISSING });

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const playerState = game.players.getPlayerState(playerId);

  if (!playerState) return res.status(404).json({ error: errors.PLAYER_NOT_FOUND });

  res.status(200).json(playerState);
};

const receiveVote = (req, res) => {
  const { gameId, selectedUser } = req.body;

  if (!gameId || !selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  const vote = {
    voter: req.user._id.toString(),
    votee: selectedUser,
  };
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  try {
    game.votes.receiveVote(vote, game.players, game.phase);
    res.status(200).json({ message: messages.VOTE_COMPLETED });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const receiveFortuneTarget = (req, res) => {
  const userId = req.user._id.toString();
  const { gameId, selectedUser } = req.body;

  if (!gameId || !selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const players = game.players;
  const phase = game.phase;

  try {
    game.fortune.receiveFortuneTarget(userId, selectedUser, players, phase);
    res.status(200).json({ message: messages.FORTUNE_COMPLETED });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const receiveGuardTarget = (req, res) => {
  const userId = req.user._id.toString();
  const { gameId, selectedUser } = req.body;

  if (!gameId || !selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }
  
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const players = game.players;
  const phase = game.phase;

  try {
    game.guard.receiveGuardTarget(userId, selectedUser, players, phase);
    res.status(200).json({ message: messages.GUARD_COMPLETED });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const receiveAttackTarget = (req, res) => {
  const userId = req.user._id.toString();
  const { gameId, selectedUser } = req.body;

  if (!gameId || !selectedUser) {
    return res.status(400).json({ error: errors.MISSING_DATA });
  }

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });
  
  const players = game.players;
  const phase = game.phase;

  try {
    game.attack.receiveAttackTarget(userId, selectedUser, players, phase);
    res.status(200).json({ message: messages.ATTACK_COMPLETED });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVoteHistory = (req, res) => {
  const gameId = req.params.gameId;

  if (!gameId) {
    return res.status(400).json({ error: errors.MISSING_DATA }); 
  }

  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const voteHistory = game.votes.getVoteHistory(game.phase);

  if (voteHistory === null) {
    return res.status(403).json({ error: errors.VOTE_HISTORY_NOT_FOUND });
  }

  res.status(200).json(voteHistory);
};

const getFortuneResult = (req, res) => {
  const gameId = req.params.gameId;

  if (!gameId) {
    return res.status(400).json({ error: errors.MISSING_DATA }); 
  }

  const userId = req.user._id.toString();
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const players = game.players;
  const phase = game.phase;
  const fortuneResult = game.fortune.getFortuneResult(userId, players, phase);

  if (fortuneResult === null) {
    return res.status(403).json({ error: errors.FORTUNE_RESULT_NOT_FOUND });
  }

  res.status(200).json(fortuneResult);
};

const getMediumResult = (req, res) => {
    const gameId = req.params.gameId;

    if (!gameId) {
      return res.status(400).json({ error: errors.MISSING_DATA }); 
    }

    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

    const players = game.players;
    const phase = game.phase;
    const mediumResult = game.medium.getMediumResult(userId, players, phase);

    if (mediumResult === null) {
      return res.status(403).json({ error: errors.MEDIUM_RESULT_NOT_FOUND });
    }

    res.status(200).json(mediumResult);
};

const getGuardHistory = (req, res) => {
  const gameId = req.params.gameId;

  if (!gameId) {
    return res.status(400).json({ error: errors.MISSING_DATA }); 
  }

  const userId = req.user._id.toString();
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const players = game.players;
  const phase = game.phase;
  const guardHistory = game.guard.getGuardHistory(userId, players, phase);

  if (guardHistory === null) {
    return res.status(403).json({ error: errors.GUARD_HISTORY_NOT_FOUND });
  }

  res.status(200).json(guardHistory);
};

const getAttackHistory = (req, res) => {
  const gameId = req.params.gameId;

  if (!gameId) {
    return res.status(400).json({ error: errors.MISSING_DATA }); 
  }

  const userId = req.user._id.toString();
  const game = games[gameId];

  if (!game) return res.status(404).json({ error: errors.GAME_NOT_FOUND });

  const players = game.players;
  const phase = game.phase;
  const attackHistory = game.attack.getAttackHistory(userId, players, phase);

  if (attackHistory === null) {
    return res.status(403).json({ error: errors.ATTACK_HISTORY_NOT_FOUND });
  }

  res.status(200).json(attackHistory);
};

module.exports = {
  protect,
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
