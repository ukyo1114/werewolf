const { errors } = require("../messages");
const CustomError = require("../classes/CustomError");

const handleServerError = (error) => {
  console.error("error:", error.message);
  throw new CustomError(500, errors.SERVER_ERROR);
};

const checkErrorMessage = (error, errorMessage) => {
  if (error.message === errorMessage) {
    throw new CustomError(400, errorMessage);
  }
};

module.exports = { handleServerError, checkErrorMessage };

// テスト済み