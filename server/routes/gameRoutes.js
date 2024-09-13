const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { games } = require("../classes/gameState");

const router = express.Router();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized, Token Failed !");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, Token Failed !");
  }
});


const getUserState = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const userState = games[gameId].getUserState(userId);
    res.json(userState);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const receiveVote = ((req, res) => {
  try {
    const { gameId, selectedUser } = req.body;
    const vote = {
      voter: req.user._id.toString(),
      votee: selectedUser
    }
    games[gameId].receiveVote(vote);
    res.status(200).send();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const receiveFortuneTarget = ((req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    games[gameId].receiveFortuneTarget(userId, selectedUser);
    res.status(200).send();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const receiveGuardTarget = ((req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    games[gameId].receiveGuardTarget(userId, selectedUser);
    res.status(200).send();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const receiveAttackTarget = ((req, res) => {
  try {
    const userId = req.user._id.toString();
    const { gameId, selectedUser } = req.body;
    games[gameId].receiveAttackTarget(userId, selectedUser);
    res.status(200).send();
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getVoteHistory = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const votes = games[gameId].getVoteHistory(userId);
    res.json(votes);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getFortuneResult = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const fortuneResult = games[gameId].getFortuneResult(userId);
    res.json(fortuneResult);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getMediumResult = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const mediumResult = games[gameId].getMediumResult(userId);
    res.json(mediumResult);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getGuardHistory = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const guardHistory = games[gameId].getGuardHistory(userId);
    res.json(guardHistory);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getAttackHistory = ((req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.user._id.toString();
    const attackHistory = games[gameId].getAttackHistory(userId);
    res.json(attackHistory);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

router.get("/getUserState/:gameId", protect, getUserState);
router.put("/vote", protect, receiveVote);
router.put("/fortune", protect, receiveFortuneTarget);
router.put("/guard", protect, receiveGuardTarget);
router.put("/attack", protect, receiveAttackTarget);
router.get("/getvotehistory/:gameId", protect, getVoteHistory);
router.get("/getfortuneresult/:gameId", protect, getFortuneResult);
router.get("/getmediumresult/:gameId", protect, getMediumResult);
router.get("/getguardhistory/:gameId", protect, getGuardHistory);
router.get("/getattackhistory/:gameId", protect, getAttackHistory);

module.exports = router;
