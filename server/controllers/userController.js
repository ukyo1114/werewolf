const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const { games, GameState } = require("../classes/GameState");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id");
      return next();
    } catch (error) {
      return res.status(401).json({ error: "認証に失敗しました" });
    }
  }
  if (!token) return res.status(401).json({ error: "トークンがありません" });
};

const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "未入力の項目があるようです。" });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "ユーザーが既に存在しているようです。" });
    }
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "ユーザーの作成に失敗したようです。" });
    }
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "未入力の項目があるようです。" });
  }

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "メールアドレスかパスワードが無効のようです。" });
    }

  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生したようです。" });
    console.error("エラー:", error.message);
  }
};

// プロフィールの変更を通知する処理を追加してね
const updateProfile = async (req, res) => {
  const { userName, picture } = req.body;
  if (!userName && !picture) return res.status(400);
  const userId = req.user._id.toString();

  const isUserInGame = GameState.isUserInGame(userId);
  if (isUserInGame) {
    return res.status(403).json({
      error: "参加中のゲームが進行中なのでプロフィールを更新できないようです。",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404);

    if (userName) user.name = userName;
    if (picture) user.pic = picture;

    await user.save();
    res.status(200).json({
      name: user.name,
      pic: user.pic,
    });
  } catch (error) {
    res.status(500);
    console.error("エラー:", error.message);
  }
};

const updateUserSettings = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email && !newPassword) {
    return res.status(400).json({ error: "メールアドレスまたは新しいパスワードを入力してください" });
  }
  if (!currentPassword) {
    return res.status(400).json({ error: "現在のパスワードを入力してください" });
  }

  const userId = req.user._id.toString();

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "ユーザーが見つかりません" });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: "パスワードが間違っています" });

    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: "有効なメールアドレスを入力してください" });
      }
      user.email = email;
    }
    if (newPassword) user.password = newPassword;
    await user.save();
    res.status(200).json({ email: user.email });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラーが発生しました" });
    console.error(error.message);
  }
};

const validateEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
 
module.exports = {
  protect,
  registerUser,
  authUser,
  updateProfile,
  updateUserSettings,
};