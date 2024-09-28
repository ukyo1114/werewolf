const express = require("express");
const router = express.Router();
const {
  getBlockUsers,
  registerBlock,
  cancelBlock,
} = require("../controllers/blockController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/userList/:channelId", getBlockUsers);
router.put("/register", registerBlock);
router.put("/cancel", cancelBlock);

module.exports = router;