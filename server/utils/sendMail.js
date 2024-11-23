const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createEmail = (email, verificationToken) => {
  const verificationLink = `${process.env.SERVER_URL}/api/verify?token=${verificationToken}`;

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "メールアドレスの確認",
    text: `以下のリンクをクリックしてメールアドレスを確認してください: ${verificationLink}`,
    html: `<p>以下のリンクをクリックしてメールアドレスを確認してください:</p><a href="${verificationLink}">確認リンク</a>`,
  }
};

const sendMail = async(email, verificationToken) => {
  const mailOptions = createEmail(email, verificationToken);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = { sendMail };