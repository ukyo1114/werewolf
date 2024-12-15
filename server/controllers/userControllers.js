const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const {
  generateToken,
  genVerificationToken,
} = require("../utils/generateToken");
const { GameState } = require("../classes/GameState");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const { uploadPicture } = require("../utils/userUtils");
const { sendMail } = require("../utils/sendMail");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  const emailExists = await User.exists({ email });
  if (emailExists) throw new CustomError(400, errors.EMAIL_ALREADY_REGISTERED);

  const verificationToken = genVerificationToken({ email });
  const user = await User.create({
    name, email, password, pic: null, verificationToken
  });
  if (!user) throw new CustomError(400, errors.USER_CREATION_FAILED);

  await sendMail(email, verificationToken);

  const userId = user._id.toString();
  const filePath = await uploadPicture(userId, pic);
  await User.findByIdAndUpdate(userId, { pic: filePath });

  const token = genVerificationToken({ email });
  res.status(201).json({ token });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new CustomError(401, errors.INVALID_EMAIL_OR_PASSWORD);
  }

  if (!user.isVerified) {
    const resendToken = genVerificationToken({ email });
    return res.status(403).json({ resendToken });
  }

  res.json({
    _id: user._id,
    name: user.name,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

// プロフィールの変更を通知する処理を追加してね
const updateProfile = asyncHandler(async (req, res) => {
  const { userId, body: { userName, pic } } = req;
  if (!userName && !pic) throw new CustomError(400, errors.MISSING_DATA);

  const isUserInGame = GameState.isUserInGame(userId);
  if (isUserInGame) {
    throw new CustomError(403, errors.PROFILE_UPDATE_NOT_ALLOWED_DURING_GAME);
  }

  if (pic) await uploadPicture(userId, pic);
  if (userName) await User.findByIdAndUpdate(userId, { name: userName });

  res.status(200).send();
});

const updateUserSettings = asyncHandler(async (req, res) => {
  const { userId, body: { email, currentPassword, newPassword } } = req;

  // パスワード認証
  const user = await User.findById(userId).select("password");
  const isPasswordMatch = await user.matchPassword(currentPassword);
  if (!isPasswordMatch) throw new CustomError(401, errors.INVALID_PASSWORD);

  if (email) {
    const emailExists = await User.exists({ email });
    if (emailExists) {
      throw new CustomError(400, errors.EMAIL_ALREADY_REGISTERED);
    }

    const verificationToken = genVerificationToken({ userId, email });
    await sendMail(email, verificationToken);
  };
  
  if (newPassword) {
    // バリデーション回避のためにパスワードフィールドを除外してユーザーを取得
    const user = await User.findById(userId).select("-password");
    user.password = newPassword;
    await user.save();
  };
  
  res.status(200).send();
});
 
module.exports = {
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
};