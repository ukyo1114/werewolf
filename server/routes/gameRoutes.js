const express = require("express");
const { body, param } = require("express-validator");

const {
  checkGame,
  getGame,
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
} = require("../controllers/gameController");
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

const defineGetRoute = (route, controllers) => {
  router.get(
    route,
    [gameIdChainParam],
    validateRequest,
    ...controllers
  );
};

const definePostRoute = (route, controllers) => {
  router.post(
    route,
    [gameIdChainBody, selectedUserChain],
    validateRequest,
    ...controllers
  );
};

router.use(protect());

defineGetRoute("/join/:gameId", [getGame, joinGame]);
defineGetRoute("/player-state/:gameId", [getGame, getPlayerState]);
defineGetRoute("/vote-history/:gameId", [getGame, getVoteHistory]);
defineGetRoute("/fortune-result/:gameId", [getGame, getFortuneResult]);
defineGetRoute("/medium-result/:gameId", [getGame, getMediumResult]);
defineGetRoute("/guard-history/:gameId", [getGame, getGuardHistory]);
defineGetRoute("/attack-history/:gameId", [getGame, getAttackHistory]);

definePostRoute("/vote", [checkGame, receiveVote]);
definePostRoute("/fortune", [checkGame, receiveFortuneTarget]);
definePostRoute("/guard", [checkGame, receiveGuardTarget]);
definePostRoute("/attack", [checkGame, receiveAttackTarget]);

module.exports = router;
