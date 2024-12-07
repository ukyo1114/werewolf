const express = require("express");
const { query, body } = require("express-validator");

const validateRequest = require("../middleware/validateRequest");
const {
  verifyEmail, resend, requestPasswordReset, resetPassword,
} = require("../controllers/verifyControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const verificationTokenChain =
  query("token")
    .isJWT()
    .withMessage("認証トークンの形式が無効です");

const verificationTokenChainBody =
  body("token")
    .isJWT()
    .withMessage("認証トークンの形式が無効です");

const emailChain =
  body("email")
    .notEmpty()
    .withMessage("メールアドレスは必須です")
    .isEmail()
    .withMessage("有効なメールアドレスを入力してください");

const passwordChain =
  body("password")
    .notEmpty()
    .withMessage("パスワードは必須です")
    .isLength({ min: 8, max: 20 })
    .withMessage("パスワードは8文字以上20文字以内である必要があります");

router.get(
  "/email",
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

router.post(
  "/request-password-reset",
  [emailChain],
  validateRequest,
  requestPasswordReset,
);

router.post(
  "/reset-password",
  [passwordChain],
  validateRequest,
  protect("resetPassword"),
  resetPassword,
);

module.exports = router;