const express = require("express");
const router = express.Router();
const {
  getBlockUsers,
  registerBlock,
  cancelBlock,
} = require("../controllers/blockControllers");
const { protect } = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const channelIdChainParam =
  param("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

const channelIdChainBody =
  body("channelId")
    .isMongoId()
    .withMessage("チャンネルIDが無効です");

const createSelectedUserChain = (selectedUser) => (
  body(selectedUser)
    .isMongoId()
    .withMessage("選択されたユーザーが無効です")
);

router.use(protect());

router.get(
  "/user-list/:channelId",
  [channelIdChainParam],
  validateRequest,
  getBlockUsers
);

router.put(
  "/register",
  [channelIdChainBody, createSelectedUserChain("selectedUser")],
  validateRequest,
  registerBlock
);

router.put(
  "/cancel",
  [channelIdChainBody, createSelectedUserChain("selectedBUser")],
  validateRequest,
  cancelBlock
);

module.exports = router;