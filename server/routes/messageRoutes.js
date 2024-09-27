const express = require("express");
const router = express.Router();
const {
  checkGameState,
  sendMessage,
  getMessages,
  connect,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", protect, checkGameState, sendMessage);
router.get("/getmessages/:channelId", protect, getMessages);
router.get("/connect/:channelId", protect, connect);

module.exports = router;
