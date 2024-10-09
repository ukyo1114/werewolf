const express = require("express");
const router = express.Router();
const getGameList = require("../controllers/spectateController");
const { protect } = require("../middleware/authMiddleware");
const { param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const channelIdChain =
  param("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

router.use(protect);

router.get(
  "/game-list/:channelId",
  [channelIdChain],
  validateRequest,
  getGameList
);

module.exports = router;