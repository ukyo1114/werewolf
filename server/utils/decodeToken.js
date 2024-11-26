const jwt = require("jsonwebtoken");

const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");

const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new CustomError(401, errors.INVALID_TOKEN);
  }
};

module.exports = { decodeToken };