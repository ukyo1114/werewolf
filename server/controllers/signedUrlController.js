const AWS = require('aws-sdk');
const dotenv = require("dotenv");

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const generateSignedUrl = (req, res) => {
  const userId = params
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `user-icons/${userId}`,
    Expires: 60,
  }
}