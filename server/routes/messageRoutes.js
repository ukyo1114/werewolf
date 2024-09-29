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

router.post("/", checkGameState, sendMessage);
router.get("/getmessages/:channelId", getMessages);
router.get("/connect/:channelId", connect);

module.exports = router;
