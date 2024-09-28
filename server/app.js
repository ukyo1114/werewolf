const express = require("express");
const http = require("http");
const createError = require("http-errors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const blockRoutes = require("./routes/blockRoutes");
const gameRoutes = require("./routes/gameRoutes");
const socketHandler = require("./socketHandlers/socketHandler");
const errorHandler = require("./middleware/errorHandler");
const { errors } = require("./messages");

const app = express();

dotenv.config();
connectDB();

// ミドルウェアの設定
app.use(express.json()); // JSONリクエストボディの解析
app.use(express.urlencoded({ extended: true })); // URLエンコードされたデータの解析

// ルートの設定
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/user", userRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/game", gameRoutes);

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