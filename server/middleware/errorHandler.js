const { errors } = require("../messages");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || errors.SERVER_ERROR;

  res.status(statusCode).json({ error: message });

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }
};

module.exports = errorHandler;
