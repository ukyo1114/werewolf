const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const { GameState } = require("../classes/GameState");
const { errors } = require("../messages");
const EventEmitter = require("events");
const userEvents = new EventEmitter();
const CustomError = require('../classes/CustomError');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    throw new CustomError(400, errors.MISSING_DATA);
  }

  const userExists = await User.findOne({ email });

  if (userExists) throw new CustomError(400, errors.EMAIL_ALREADY_REGISTERED);

  const user = await User.create({ name, email, password, pic });

  if (!user) throw new CustomError(400, errors.USER_CREATION_FAILED);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new CustomError(400, errors.MISSING_DATA);

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new CustomError(401, errors.INVALID_EMAIL_OR_PASSWORD);
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    pic: user.pic,
    token: generateToken(user._id),
  });
});

// プロフィールの変更を通知する処理を追加してね
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { userName, picture } = req.body;

  if (!userName && !picture) throw new CustomError(400, errors.MISSING_DATA);

  const isUserInGame = GameState.isUserInGame(userId);

  if (isUserInGame) {
    throw new CustomError(403, errors.PROFILE_UPDATE_NOT_ALLOWED_DURING_GAME);
  }

  const user = await User.findById(userId).select("_id name pic");

  if (!user) throw new CustomError(401, errors.USER_NOT_FOUND);
  if (userName) user.name = userName;
  if (picture) user.pic = picture;

  await user.save();

  res.status(200).json({
    name: user.name,
    pic: user.pic,
  });

  userEvents.emit("profileUpdated", user);
});

const updateUserSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { email, currentPassword, newPassword } = req.body;

  if (!email && !newPassword) throw new CustomError(400, errors.MISSING_DATA);

  if (!currentPassword) throw new CustomError(400, errors.PASSWORD_MISSING);

  const user = await User.findById(userId);

  if (!user) throw new CustomError(401, errors.USER_NOT_FOUND);

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) throw new CustomError(401, errors.INVALID_PASSWORD);

  if (email) {
    if (!validateEmail(email)) {
      throw new CustomError(400, errors.INVALID_EMAIL);
    }
    
    user.email = email;
  }

  if (newPassword) user.password = newPassword;

  await user.save();
  res.status(200).json({ email: user.email });
});

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
 
module.exports = {
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
  userEvents,
};