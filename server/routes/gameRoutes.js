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

router.get("/getUserState/:gameId", protect, getPlayerState);
router.post("/vote", protect, receiveVote);
router.post("/fortune", protect, receiveFortuneTarget);
router.post("/guard", protect, receiveGuardTarget);
router.post("/attack", protect, receiveAttackTarget);
router.get("/getvotehistory/:gameId", protect, getGame, getVoteHistory);
router.get("/getfortuneresult/:gameId", protect, getGame, getFortuneResult);
router.get("/getmediumresult/:gameId", protect, getGame, getMediumResult);
router.get("/getguardhistory/:gameId", protect, getGame, getGuardHistory);
router.get("/getattackhistory/:gameId", protect, getGame, getAttackHistory);

module.exports = router;
