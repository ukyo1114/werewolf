const express = require("express");
const router = express.Router();
const {
  protect,
  checkGameState,
  sendMessage,
  getMessages,
  connect,
} = require("../controllers/messageController");

router.post("/", protect, checkGameState, sendMessage);
router.get("/getmessages/:channelId", protect, getMessages);
router.get("/connect/:channelId", protect, connect);

module.exports = router;
