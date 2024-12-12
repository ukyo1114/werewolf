const asyncHandler = require("express-async-handler");

const Game = require("../models/gameModel");
const User = require("../models/userModel");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const { channelEvents } = require("./channelControllers");

const games = {};

const checkGame = (source = "body") => (req, res, next) => {
  const { userId, [source]: { gameId } } = req;

  const game = games[gameId];
  if (!game) throw new CustomError(404, errors.GAME_NOT_FOUND);
  if (game.isProcessing) throw new CustomError(409, errors.GAME_IS_PROCESSING);

  req.playerId = userId;
  req.game = game;
  next();
};

// TODO: ゲームを利用できるかどうか認証を追加
const joinGame = asyncHandler(async (req, res) => {
  const { userId, params: { gameId } } = req;

  const game = await Game.findByIdAndUpdate(
      gameId,
      { $addToSet: { users: userId } },
      { new: true },
    )
    .select("_id users channel")
    .populate("users", "_id name pic")
    .populate("channel", "channelName description")
    .lean();

  const user = await User.findById(userId).select("_id name pic").lean();

  channelEvents.emit("userJoined", { channelId: gameId, user }); 

  res.status(200).json({ game });
});

const getPlayerState = (req, res) => {
  const { playerId, game } = req;
  const playerState = game.players.getPlayerState(playerId);
  res.status(200).json(playerState);
};

const receiveVote = (req, res) => {
  const { playerId, game, body: { selectedUser } } = req;

  game.votes.receiveVote(playerId, selectedUser);
  res.status(200).send();
};

const receiveFortuneTarget = (req, res) => {
  const { playerId, game, body: { selectedUser } } = req;

  game.fortune.receiveFortuneTarget(playerId, selectedUser);
  res.status(200).send();
};

const receiveGuardTarget = (req, res) => {
  const { playerId, game, body: { selectedUser } } = req;

  game.guard.receiveGuardTarget(playerId, selectedUser);
  res.status(200).send();
};

const receiveAttackTarget = (req, res) => {
  const { playerId, game, body: { selectedUser } } = req;

  game.attack.receiveAttackTarget(playerId, selectedUser);
  res.status(200).send();
};

const getVoteHistory = (req, res) => {
  const { game } = req;
  const voteHistory = game.votes.getVoteHistory();
  res.status(200).json({ voteHistory });
};

const getFortuneResult = (req, res) => {
  const { playerId, game } = req;
  const fortuneResult = game.fortune.getFortuneResult(playerId);
  res.status(200).json({ fortuneResult });
};

const getMediumResult = (req, res) => {
  const { playerId, game } = req;
  const mediumResult = game.medium.getMediumResult(playerId);
  res.status(200).json({ mediumResult });
};

const getGuardHistory = (req, res) => {
  const { playerId, game } = req;
  const guardHistory = game.guard.getGuardHistory(playerId);
  res.status(200).json({ guardHistory });
};

const getAttackHistory = (req, res) => {
  const { playerId, game } = req;
  const attackHistory = game.attack.getAttackHistory(playerId);
  res.status(200).json({ attackHistory });
};

module.exports = {
  games,
  checkGame,
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
