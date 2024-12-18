const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");
const { decodeToken } = require("../utils/decodeToken");

const protect = (mode = "user") =>
  asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new CustomError(401, errors.TOKEN_MISSING);
    }

    const token = header.split(" ")[1];
    const decoded = decodeToken(token);

    if (mode === "user") {
      const user = await User.findById(decoded.id).select("_id").lean();
      if (!user) throw new CustomError(401, errors.USER_NOT_FOUND);
      req.userId = user._id.toString();
    }

    if (mode === "resetPassword") {
      const user = await User.findOne({ email: decoded.email }).select("_id").lean();
      if (!user || decoded.action !== "resetPassword") {
        throw new CustomError(401, errors.INVALID_TOKEN);
      }

      req.userId = user._id.toString();
    }

    next();
  });

module.exports = { protect };
