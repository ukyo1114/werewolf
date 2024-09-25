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

  if (!playerState) return res.status(404).json({ error: errors.PLAYER_NOT_FOUND })
  res.json(playerState);
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
    const message = error.message;

    if (message === errors.INVALID_VOTE) {
      return res.status(400).json({ error: message });
    }

    res.status(500).json({ error: message });
    console.error("error:", message);
  }
};

const receiveFortuneTarget = (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    if (!gameId || !selectedUser) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    game.receiveFortuneTarget(userId, selectedUser);
    res.status(200).json({ message: "占い先の指定が完了したようです。" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const receiveGuardTarget = (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    if (!gameId || !selectedUser) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    game.receiveGuardTarget(userId, selectedUser);
    res.status(200).json({ message: "護衛先の指定が完了したようです。" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const receiveAttackTarget = (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    if (!gameId || !selectedUser) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    game.receiveAttackTarget(userId, selectedUser);
    res.status(200).json({ message: "襲撃先の指定が完了したようです。" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getVoteHistory = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    const votes = game.getVoteHistory(userId);
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getFortuneResult = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    const fortuneResult = game.getFortuneResult(userId);
    res.json(fortuneResult);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getMediumResult = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    const mediumResult = game.getMediumResult(userId);
    res.json(mediumResult);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getGuardHistory = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    const guardHistory = game.getGuardHistory(userId);
    res.json(guardHistory);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const getAttackHistory = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    const attackHistory = game.getAttackHistory(userId);
    res.json(attackHistory);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
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
