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
