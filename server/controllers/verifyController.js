const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const CustomError = require("../classes/CustomError");
const User = require("../models/userModel");
const { errors } = require("../messages");
const { genVerificationToken } = require("../utils/generateToken");
const { sendMail } = require("../utils/sendMail");

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.email;
  const user = await User.findOneAndUpdate(
    { email, verificationToken: token },
    { isVerified: true, verificationToken: null },
    { new: true }
  ).lean();
  if (!user) throw new CustomError(400, errors.INVALID_TOKEN);
  
  res.status(200).send("メールアドレスの確認が完了しました");
});

const resend = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.email;

  const user = await User.findOne({ email }).select("isVerified").lean();
  if (!user) throw new CustomError(404, errors.USER_NOT_FOUND);
  if (user.isVerified) throw new CustomError(409, "すでに認証済みです");

  const verificationToken = genVerificationToken(email);
  await User.findOneAndUpdate({ email }, { verificationToken });
  await sendMail(email, verificationToken);

  res.status(202).send("確認メールを再送信しました");
});

module.exports = { verifyEmail, resend };