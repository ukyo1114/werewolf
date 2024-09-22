const express = require("express");
const router = express.Router();
const {
  protect,
  fetchChannelList,
  createChannel,
  channelSettings,
  enterToChannel,
  leaveChannel,
  userList,
  getBlockUserList,
  block,
  cancelBlock,
} = require("../controllers/channelController");

router.get("/", protect, fetchChannelList);
router.post("/createchannel", protect, createChannel);
router.post("/channelsettings", protect, channelSettings);
router.post("/channelenter", protect, enterToChannel);
router.post("/leaveChannel", protect, leaveChannel);
router.get("/getblockeduserlist/:channelId", protect, getBlockUserList);
router.post("/block", protect, block);
router.post("/cancelblock", protect, cancelBlock);
router.get("/:channelId", protect, userList);

module.exports = router;
