const express = require("express");
const router = express.Router();
const {
  fetchChannelList,
  createChannel,
  channelSettings,
  enterToChannel,
  leaveChannel,
} = require("../controllers/channelController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const channelIdChain =
  body("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

const channelNameChain =
  body("channelName")
    .notEmpty()
    .withMessage("チャンネル名は必須です")
    .isLength({ min: 2, max: 12 })
    .withMessage("チャンネル名は2文字以上12文字以内である必要があります");

const channelNameChainOpt =
  body("channelName")
    .optional()
    .isLength({ min: 2, max: 12 })
    .withMessage("チャンネル名は2文字以上12文字以内である必要があります");

const descriptionChain =
  body("description")
    .notEmpty()
    .withMessage("説明文は必須です")
    .isLength({ min: 2, max: 2000 })
    .withMessage("説明文は2文字以上2000文字以内である必要があります");

const descriptionChainOpt =
  body("description")
    .optional()
    .isLength({ min: 2, max: 2000 })
    .withMessage("説明文は2文字以上2000文字以内である必要があります");

const passwordChain =
  body("password")
    .isLength({ max: 20 })
    .withMessage("パスワードは20文字以内である必要があります");

router.use(protect);

router.get("/list", fetchChannelList);

router.post(
  "/create",
  [channelNameChain, descriptionChain, passwordChain],
  validateRequest,
  createChannel
);

router.put(
  "/settings",
  [channelIdChain, channelNameChainOpt, descriptionChainOpt, passwordChain],
  validateRequest,
  channelSettings
);

router.post(
  "/enter",
  [channelIdChain, passwordChain],
  validateRequest,
  enterToChannel
);

router.put("/leave", [channelIdChain], validateRequest, leaveChannel);

module.exports = router;
