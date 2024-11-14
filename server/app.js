const dotenv = require("dotenv");
const envFile = `config/.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const express = require("express");
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
const socketHandler = require("./socketHandlers/socketHandler");
const errorHandler = require("./middleware/errorHandler");

const app = express();
connectDB();

// ミドルウェアの設定
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