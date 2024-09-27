const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/gameController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/player-state/:gameId", getGame, getPlayerState);
router.post("/vote", checkGame, receiveVote);
router.post("/fortune", checkGame, receiveFortuneTarget);
router.post("/guard", checkGame, receiveGuardTarget);
router.post("/attack", checkGame, receiveAttackTarget);

router.get("/vote-history/:gameId", getGame, getVoteHistory);
router.get("/fortune-result/:gameId", getGame, getFortuneResult);
router.get("/medium-result/:gameId", getGame, getMediumResult);
router.get("/guard-history/:gameId", getGame, getGuardHistory);
router.get("/attack-history/:gameId", getGame, getAttackHistory);

module.exports = router;
