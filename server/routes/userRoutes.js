const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(registerUser);
router.route("/login").post(authUser);
router.route("/profile").put(protect, updateProfile);
router.route("/user").put(protect, updateUserSettings);

module.exports = router;
