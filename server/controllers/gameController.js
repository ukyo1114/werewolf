const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { games } = require("../classes/gameState");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id");
      return next();
    } catch (error) {
      return res.status(401);
    }
  }
  if (!token) return res.status(401);
};

const getUserState = (req, res) => {
  try {
    const gameId = req.params.gameId;
    if (!gameId) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const userId = req.user._id.toString();
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つからないようです。" });
    }
    const userState = game.getUserState(userId);
    res.json(userState);
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const receiveVote = (req, res) => {
  try {
    const { gameId, selectedUser } = req.body;
    if (!gameId || !selectedUser) {
      return res.status(400).json({ error: "必要なデータが無いようです。" });
    }
    const vote = {
      voter: req.user._id.toString(),
      votee: selectedUser,
    };
    const game = games[gameId];

    if (!game) {
      return res.status(404).json({ error: "ゲームが見つかりません。" });
    }
    game.receiveVote(vote);
    res.status(200).json({ message: "投票が完了したようです。" });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
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
  getUserState,
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
