const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const { GameState } = require("../classes/GameState");
const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");
const {
  getUserById,
  matchPassword,
  uploadPicture,
} = require("../utils/userUtils");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) throw new CustomError(400, errors.EMAIL_ALREADY_REGISTERED);

  const user = await User.create({ name, email, password, pic: null });
  if (!user) throw new CustomError(400, errors.USER_CREATION_FAILED);

  const userId = user._id.toString();
  const filePath = await uploadPicture(userId, pic);

  const userWithoutPass = await getUserById(user._id, false);

  userWithoutPass.pic = filePath;

  await userWithoutPass.save();

  res.status(201).json({
    _id: userId,
    name,
    email,
    pic: filePath,
    token: generateToken(user._id),
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    throw new CustomError(401, errors.INVALID_EMAIL_OR_PASSWORD);
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
  const userId = req.userId;
  const { userName, pic } = req.body;
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
  const userId = req.userId;
  const { email, currentPassword, newPassword } = req.body;

  await matchPassword(userId, currentPassword);
  
  const user = await getUserById(userId, !!newPassword);
  if (email) user.email = email;
  if (newPassword) user.password = newPassword;

  await user.save();
  res.status(200).json({ email: user.email });
});
 
module.exports = {
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
};