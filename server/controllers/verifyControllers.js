const asyncHandler = require("express-async-handler");

const CustomError = require("../classes/CustomError");
const User = require("../models/userModel");
const { errors } = require("../messages");

const { genVerificationToken } = require("../utils/generateToken");
const { sendMail } = require("../utils/sendMail");
const { completeVerification } = require("../utils/verifyUtils");
const { decodeToken } = require("../utils/decodeToken");

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { userId, email, action } = decodeToken(token);

  if (action !== "verifyEmail") {
    throw new CustomError(400, errors.INVALID_TOKEN);
  }

  if (userId) {
    const user = await User.findByIdAndUpdate(userId, { email });
    if (!user) throw new CustomError(400, errors.INVALID_TOKEN);
    return res.status(200).send("メールアドレスの変更が完了しました");
  }

  await completeVerification(email, token);
  
  res.status(200).send("メールアドレスの確認が完了しました");
});

const resend = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const { email, action } = decodeToken(token);

  if (action !== "verifyEmail") {
    throw new CustomError(400, errors.INVALID_TOKEN);
  }

  const user = await User.findOne({ email }).select("isVerified").lean();
  if (!user) throw new CustomError(404, errors.USER_NOT_FOUND);
  if (user.isVerified) throw new CustomError(409, "すでに認証済みです");

  const verificationToken = genVerificationToken({ email });
  await User.findOneAndUpdate({ email }, { verificationToken });
  await sendMail(email, verificationToken);

  res.status(202).send("確認メールを再送信しました");
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select("isVerified").lean();
  if (!user) throw new CustomError(400, errors.EMAIL_NOT_REGISTERED);
  if (!user.isVerified) {
    const resendToken = genVerificationToken({ email });
    return res.status(403).json({ resendToken });
  }

  const verificationToken = genVerificationToken({
    email,
    action: "resetPassword",
  });
  await sendMail(email, verificationToken, "resetPassword");

  res.status(202).send();
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, body: { password } } = req;

  const user = await User.findById(userId).select("password");
  user.password = password;
  await user.save();

  res.status(204).send();
});

module.exports = { verifyEmail, resend, requestPasswordReset, resetPassword };