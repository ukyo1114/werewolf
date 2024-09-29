const express = require("express");
const router = express.Router();
const getGameList = require("../controllers/spectateController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/game-list/:channelId", getGameList);

module.exports = router;