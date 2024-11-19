const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const CustomError = require("../classes/CustomError");
const User = require("../models/userModel");
const { errors } = require("../messages");

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

module.exports = verifyEmail;