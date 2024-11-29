const dotenv = require("dotenv");
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`
});

const express = require("express");
const compression = require('compression');
const http = require("http");
const createError = require("http-errors");
const path = require('path');

const connectDB = require("./utils/connectDB");
const userRoutes = require("./routes/userRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const spectateRoutes = require("./routes/spectateRoutes");
const blockRoutes = require("./routes/blockRoutes");
const gameRoutes = require("./routes/gameRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const socketHandler = require("./socketHandlers/socketHandler");
const errorHandler = require("./middleware/errorHandler");

const app = express();
connectDB();

// ミドルウェアの設定
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public/build")));

// ルートの設定
app.use("/api/user", userRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/spectate", spectateRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/verify", verifyRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/build", "index.html"));
});

// HTTPサーバーの作成
const server = http.createServer(app);

// Socket.IO setup
socketHandler(server);

// 未定義のルートに対する404エラーを作成
app.use((req, res, next) => {
  next(createError(404));
});

// グローバルエラーハンドリングミドルウェア
app.use(errorHandler);

// サーバーの起動
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;