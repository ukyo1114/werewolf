const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const token = jwt.sign(
    { id }, process.env.JWT_SECRET, { expiresIn: "30d" }
  );
  return token;
};

const genVerificationToken = (email) => {
  const token = jwt.sign(
    { email }, process.env.JWT_SECRET, { expiresIn: "1d" }
  );
  return token;
};

module.exports = { generateToken, genVerificationToken };
