const CustomError = require("../classes/CustomError");
const User = require("../models/userModel");
const { errors } = require("../messages");

const completeVerification = async (email, token) => {
  const user = await User.findOneAndUpdate(
    { email, verificationToken: token },
    { isVerified: true, verificationToken: null },
    { new: true }
  );
  if (!user) throw new CustomError(400, errors.INVALID_TOKEN);
};

module.exports = { completeVerification };