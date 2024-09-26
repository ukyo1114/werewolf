const express = require("express");
const router = express.Router();
const {
  protect,
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

router.use(protect);

router.get("/player-state/:gameId", getPlayerState);
router.post("/vote", receiveVote);
router.post("/fortune", receiveFortuneTarget);
router.post("/guard", receiveGuardTarget);
router.post("/attack", receiveAttackTarget);

router.get("/vote-history/:gameId", getGame, getVoteHistory);
router.get("/fortune-result/:gameId", getGame, getFortuneResult);
router.get("/medium-result/:gameId", getGame, getMediumResult);
router.get("/guard-history/:gameId", getGame, getGuardHistory);
router.get("/attack-history/:gameId", getGame, getAttackHistory);

module.exports = router;
