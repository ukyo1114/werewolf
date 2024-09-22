const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/gameController");

router.get("/getUserState/:gameId", protect, getUserState);
router.post("/vote", protect, receiveVote);
router.post("/fortune", protect, receiveFortuneTarget);
router.post("/guard", protect, receiveGuardTarget);
router.post("/attack", protect, receiveAttackTarget);
router.get("/getvotehistory/:gameId", protect, getVoteHistory);
router.get("/getfortuneresult/:gameId", protect, getFortuneResult);
router.get("/getmediumresult/:gameId", protect, getMediumResult);
router.get("/getguardhistory/:gameId", protect, getGuardHistory);
router.get("/getattackhistory/:gameId", protect, getAttackHistory);

module.exports = router;
