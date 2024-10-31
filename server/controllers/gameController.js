const Game = require("../models/gameModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { games } = require("../classes/GameState");
const { messages, errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const {
  handleServerError,
  checkErrorMessage,
} = require("../utils/handleError");
const { channelEvents } = require("../socketHandlers/chatNameSpace");

const checkGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const { gameId } = req.body;
  const game = games[gameId];

  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);
  if (game.isProcessing) throw new CustomError(409, errors.GAME_IS_PROCESSING);

  req.playerId = playerId;
  req.game = game;
  next();
};

const getGame = (req, res, next) => {
  const playerId = req.user._id.toString();
  const gameId = req.params.gameId;
  const game = games[gameId];
  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);

  req.playerId = playerId;
  req.game = game;
  next();
};

const joinGame = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const gameId = req.params.gameId;
  const game = await Game.findByIdAndUpdate(
    gameId,
    { $addToSet: { users: userId } },
    { new: true },
  )
    .select("_id users channel")
    .populate("users", "_id name pic");

  const user = await User.findById(userId).select("_id name pic");
  channelEvents.emit("userJoined", { channelId: gameId, user: user }); 

  res.status(200).json(game);
});

const getPlayerState = (req, res) => {
  const { playerId, game } = req;
  
  try {
    const playerState = game.players.getPlayerState(playerId);
    if (!playerState) throw new CustomError(404, errors.PLAYER_NOT_FOUND);

    res.status(200).json(playerState);
  } catch (error) {
    handleServerError(error);
  }
};

const receiveVote = (req, res) => {
  const { playerId, game } = req;
  const { selectedUser } = req.body;

  try {
    game.votes.receiveVote(playerId, selectedUser);
    res.status(200).json({ message: messages.VOTE_COMPLETED });
  } catch (error) {
    checkErrorMessage(error, errors.INVALID_VOTE);
    handleServerError(error);
  }
};

const receiveFortuneTarget = (req, res) => {
  const { playerId, game } = req;
  const { selectedUser } = req.body;

  try {
    game.fortune.receiveFortuneTarget(playerId, selectedUser);
    res.status(200).json({ message: messages.FORTUNE_COMPLETED });
  } catch (error) {
    checkErrorMessage(error, errors.INVALID_FORTUNE);
    handleServerError(error);
  }
};

const receiveGuardTarget = (req, res) => {
  const { playerId, game } = req;
  const { selectedUser } = req.body;

  try {
    game.guard.receiveGuardTarget(playerId, selectedUser);
    res.status(200).json({ message: messages.GUARD_COMPLETED });
  } catch (error) {
    checkErrorMessage(error, errors.INVALID_GUARD);
    handleServerError(error);
  }
};

const receiveAttackTarget = (req, res) => {
  const { playerId, game } = req;
  const { selectedUser } = req.body;

  try {
    game.attack.receiveAttackTarget(playerId, selectedUser);
    res.status(200).json({ message: messages.ATTACK_COMPLETED });
  } catch (error) {
    checkErrorMessage(error, errors.INVALID_ATTACK);
    handleServerError(error);
  }
};

const getVoteHistory = (req, res) => {
  const { game } = req;

  try {
    const voteHistory = game.votes.getVoteHistory();

    if (voteHistory === null) {
      throw new CustomError(403, errors.VOTE_HISTORY_NOT_FOUND);
    }

    res.status(200).json(voteHistory);
  } catch (error) {
    handleServerError(error);
  }
};

const getFortuneResult = (req, res) => {
  const { playerId, game } = req;

  try{  
    const fortuneResult = game.fortune.getFortuneResult(playerId);

    if (fortuneResult === null) {
      throw new CustomError(403, errors.FORTUNE_RESULT_NOT_FOUND);
    }

    res.status(200).json(fortuneResult);
  } catch (error) {
    handleServerError(error);
  }
};

const getMediumResult = (req, res) => {
  const { playerId, game } = req;

  try {
    const mediumResult = game.medium.getMediumResult(playerId);

    if (mediumResult === null) {
      throw new CustomError(403, errors.MEDIUM_RESULT_NOT_FOUND);
    }

    res.status(200).json(mediumResult);
  } catch (error) {
    handleServerError(error);
  }
};

const getGuardHistory = (req, res) => {
  const { playerId, game } = req;

  try {
    const guardHistory = game.guard.getGuardHistory(playerId);

    if (guardHistory === null) {
      throw new CustomError(403, errors.GUARD_HISTORY_NOT_FOUND);
    }

    res.status(200).json(guardHistory);
  } catch (error) {
    handleServerError(error);
  }
};

const getAttackHistory = (req, res) => {
  const { playerId, game } = req;

  try {
    const attackHistory = game.attack.getAttackHistory(playerId);

    if (attackHistory === null) {
      throw new CustomError(403, errors.ATTACK_HISTORY_NOT_FOUND);
    }

    res.status(200).json(attackHistory);
  } catch (error) {
    handleServerError(error);
  }
};

module.exports = {
  checkGame,
  getGame,
  joinGame,
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
