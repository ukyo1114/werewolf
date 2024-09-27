const express = require("express");
const router = express.Router();
const {
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
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", fetchChannelList);
router.post("/createchannel", createChannel);
router.post("/channelsettings", channelSettings);
router.post("/channelenter", enterToChannel);
router.post("/leaveChannel", leaveChannel);
router.get("/getblockeduserlist/:channelId", getBlockUserList);
router.post("/block", block);
router.post("/cancelblock", cancelBlock);
router.get("/:channelId", userList);

module.exports = router;
