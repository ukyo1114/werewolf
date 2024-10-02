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
router.get("/connect/:channelId", connect);
router.get("/:channelId", getMessages);

module.exports = router;
