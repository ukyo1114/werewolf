const express = require("express");
const { query, body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const { verifyEmail, resend } = require("../controllers/verifyController");
const router = express.Router();

const verificationTokenChain =
  query("token")
    .isJWT()
    .withMessage("認証トークンの形式が無効です");

const verificationTokenChainBody =
  body("token")
    .isJWT()
    .withMessage("認証トークンの形式が無効です");

router.get(
  "/",
  [verificationTokenChain],
  validateRequest,
  verifyEmail,
);

router.post(
  "/resend",
  [verificationTokenChainBody],
  validateRequest,
  resend,
);

module.exports = router;