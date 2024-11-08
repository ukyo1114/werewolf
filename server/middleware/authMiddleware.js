const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new CustomError(401, errors.TOKEN_MISSING);
  }

  const token = header.split(" ")[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new CustomError(401, errors.INVALID_TOKEN);
  }

  const user = await User.findById(decoded.id).select("_id").lean();
  if (!user) throw new CustomError(401, errors.USER_NOT_FOUND);

  req.userId = user._id.toString();
  next();
});

module.exports = { protect };
