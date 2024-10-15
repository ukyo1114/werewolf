const User = require('../models/userModel');
const CustomError = require('../classes/CustomError');
const { errors } = require('../messages');

const getUserById = async (userId, password = true) => {
  let query = User.findById(userId);
  if (!password) query = query.select("-password");
  const user = await query;

  if (!user) throw new CustomError(404, errors.USER_NOT_FOUND);

  return user;
};

const matchPassword = async (userId, password) => {
  const user = await User.findById(userId).select("password");
  if (!user)  throw new CustomError(404, errors.USER_NOT_FOUND);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new CustomError(401, errors.INVALID_PASSWORD);
};

module.exports = {
  getUserById,
  matchPassword,
};