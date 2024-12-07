const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");

const nameChain =
  body("name")
    .notEmpty()
    .withMessage("ユーザー名は必須です")
    .isLength({ min: 2, max: 12 })
    .withMessage("ユーザー名は2文字以上12文字以内である必要があります");

const emailChain =
  body("email")
    .notEmpty()
    .withMessage("メールアドレスは必須です")
    .isEmail()
    .withMessage("有効なメールアドレスを入力してください");

const createPasswordChain = (password) => (
  body(password)
    .notEmpty()
    .withMessage("パスワードは必須です")
    .isLength({ min: 8, max: 20 })
    .withMessage("パスワードは8文字以上20文字以内である必要があります")
);

const nameChainOpt =
  body("userName")
    .optional()
    .isLength({ min: 2, max: 12 })
    .withMessage("ユーザー名は2文字以上12文字以内である必要があります");

const emailChainOpt =
  body("email")
  .optional()
  .isEmail()
  .withMessage("有効なメールアドレスを入力してください");

const passwordChainOpt =
  body("newPassword")
  .optional()
  .isLength({ min: 8, max: 20 })
  .withMessage("パスワードは8文字以上20文字以内である必要があります");

router.post(
  "/signup",
  [
    nameChain,
    emailChain,
    createPasswordChain("password"),
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    emailChain,
    createPasswordChain("password"),
  ],
  validateRequest,
  authUser
);

router.put(
  "/profile",
  [
    nameChainOpt,
  ],
  protect(),
  validateRequest,
  updateProfile
);

router.put(
  "/settings",
  [
    emailChainOpt,
    createPasswordChain("currentPassword"),
    passwordChainOpt,
  ],
  protect(),
  validateRequest,
  updateUserSettings
);

module.exports = router;
