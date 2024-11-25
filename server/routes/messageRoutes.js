const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { body, param, query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const channelIdChainBody =
  body("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

const contentChain =
  body("content")
    .notEmpty()
    .isLength({ max: 300 })
    .withMessage("メッセージは300文字以内で入力してください");

const channelIdChainParam =
  param("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

const messageIdChain =
  query("messageId")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("メッセージIDが無効です");

router.use(protect());

router.post(
  "/",
  [channelIdChainBody, contentChain],
  validateRequest,
  sendMessage,
);

router.get(
  "/:channelId",
  [channelIdChainParam, messageIdChain],
  validateRequest,
  getMessages,
);

module.exports = router;
