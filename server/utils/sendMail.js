const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const modeCon = {
  verify: (verificationToken) => {
    const link = `${process.env.SERVER_URL}/api/verify/email?token=${verificationToken}`;

    return {
      subject: "メールアドレスの確認",
      text: `以下のリンクをクリックしてメールアドレスを確認してください: ${link}`,
      html: `<p>以下のリンクをクリックしてメールアドレスを確認してください:</p><a href="${link}">確認リンク</a>`,
    };
  },
  resetPassword: (verificationToken) => {
    const link = `${process.env.SERVER_URL}/reset-password/${verificationToken}`;

    return {
      subject: "パスワード再設定",
      text: `以下のリンクをクリックしてパスワードを再設定してください: ${link}`,
      html: `<p>以下のリンクをクリックしてパスワードを再設定してください:</p><a href="${link}">確認リンク</a>`,
    };
  },
};

const createEmail = (email, verificationToken, mode) => {
  const config = modeCon[mode](verificationToken);

  return { from: process.env.EMAIL_USER,  to: email, ...config };
};

const sendMail = async(email, verificationToken, mode="verify") => {
  const mailOptions = createEmail(email, verificationToken, mode);

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};


module.exports = { sendMail };