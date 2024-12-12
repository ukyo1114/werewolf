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

module.exports = { uploadPicture };