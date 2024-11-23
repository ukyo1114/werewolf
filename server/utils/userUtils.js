const User = require("../models/userModel");
const CustomError = require("../classes/CustomError");
const { errors } = require("../messages");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadPicture = async (userId, pic) => {
  if (!pic) throw new CustomError(400, errors.IMAGE_MISSING);
  const filePath = `user-icons/${userId}_profile.jpeg`;
  const base64Data = pic.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filePath,
    Body: buffer,
    ContentType: "image/jpeg",
    CacheControl: "no-cache",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

const getUserById = async (userId, password = true) => {
  let query = User.findById(userId);
  if (!password) query = query.select("-password");
  const user = await query;

  if (!user) throw new CustomError(404, errors.USER_NOT_FOUND);

  return user;
};

const matchPassword = async (userId, password) => {
  const user = await User.findById(userId).select("password");
  if (!user) throw new CustomError(404, errors.USER_NOT_FOUND);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new CustomError(401, errors.INVALID_PASSWORD);
};

module.exports = {
  getUserById,
  matchPassword,
  uploadPicture,
};