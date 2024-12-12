const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  return token;
};

const genVerificationToken = ({ userId, email, action = "verifyEmail" }) => {
  const payload = { userId, email, action };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

module.exports = { generateToken, genVerificationToken };
