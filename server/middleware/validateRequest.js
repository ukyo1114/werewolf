const { validationResult } = require('express-validator');
const CustomError = require('../classes/CustomError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return next(new CustomError(400, firstError));
  }
  next();
};

module.exports = validateRequest;