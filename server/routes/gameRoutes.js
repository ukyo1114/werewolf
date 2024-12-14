const express = require("express");
const { body, param } = require("express-validator");

const {
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
} = require("../controllers/gameControllers");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const gameIdChainBody =
  body("gameId")
    .isMongoId()
    .withMessage("ゲームIDが無効です");

const gameIdChainParam =
  param("gameId")
    .isMongoId()
    .withMessage("ゲームIDが無効です");

const selectedUserChain =
  body("selectedUser")
    .isMongoId()
    .withMessage("選択されたユーザーが無効です");

const defineGetRoute = (route, controller) => {
  router.get(
    route,
    [gameIdChainParam],
    validateRequest,
    checkGame("params"),
    controller,
  );
};

const definePostRoute = (route, controller) => {
  router.post(
    route,
    [gameIdChainBody, selectedUserChain],
    validateRequest,
    checkGame("body"),
    controller,
  );
};

router.use(protect());

defineGetRoute("/join/:gameId", joinGame);
defineGetRoute("/player-state/:gameId", getPlayerState);
defineGetRoute("/vote-history/:gameId", getVoteHistory);
defineGetRoute("/fortune-result/:gameId", getFortuneResult);
defineGetRoute("/medium-result/:gameId", getMediumResult);
defineGetRoute("/guard-history/:gameId", getGuardHistory);
defineGetRoute("/attack-history/:gameId", getAttackHistory);

definePostRoute("/vote", receiveVote);
definePostRoute("/fortune", receiveFortuneTarget);
definePostRoute("/guard", receiveGuardTarget);
definePostRoute("/attack", receiveAttackTarget);

module.exports = router;
