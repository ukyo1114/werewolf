const express = require("express");
const { query } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const verifyEmail = require("../controllers/verifyController");
const router = express.Router();

const verificationTokenChain =
  query("token")
    .isJWT()
    .withMessage("認証トークンの形式が無効です");

router.get(
  "",
  [verificationTokenChain],
  validateRequest,
  verifyEmail,
);

module.exports = router;