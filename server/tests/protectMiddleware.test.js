// tests/protectMiddleware.test.js

// 環境変数を直接設定
process.env.JWT_SECRET = 'testsecret123';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const CustomError = require('../classes/CustomError');
const { errors } = require('../messages');

// エラーハンドリングミドルウェアのインポートと適用
const errorHandler = require('../middleware/errorHandler');

// テスト用Expressアプリケーションの作成
const app = express();
app.use(express.json());

// テストルートの定義
app.use('/api/test', protect, (req, res) => {
  res.status(200).json({ message: 'Authorized', user: req.user });
});
app.use(errorHandler);

describe('Protect Middleware', () => {
  let user;
  let token;

  beforeAll(async () => {
    // データベース接続が既に行われているため、特に何もしない
  });

  afterEach(async () => {
    // 各テスト後にデータベースをクリア
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    // データベース接続を閉じる
    await mongoose.connection.close();
  });

  it('認証ヘッダーが存在しない場合、401エラーが返ること', async () => {
    const res = await request(app).get('/api/test');

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe(errors.TOKEN_MISSING);
  });

  it("認証ヘッダーが 'Bearer ' で始まらない場合、401エラーが返ること", async () => {
    // トークンが未設定の状態で送信
    const res = await request(app)
      .get('/api/test')
      .set('Authorization', `Token someinvalidtoken`); // 'Bearer ' ではなく 'Token ' を使用

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe(errors.TOKEN_MISSING);
  });

  it('無効なトークンの場合、401エラーが返ること', async () => {
    const invalidToken = 'invalid.token.here';

    const res = await request(app)
      .get('/api/test')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe(errors.INVALID_TOKEN);
  });

  it('有効なトークンだがユーザーが存在しない場合、401エラーが返ること', async () => {
    // 存在しないユーザーIDを含むトークンを生成
    const nonExistentUserToken = jwt.sign(
      { id: new mongoose.Types.ObjectId() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/test')
      .set('Authorization', `Bearer ${nonExistentUserToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe(errors.USER_NOT_FOUND);
  });

  it('有効なトークンでユーザーが存在する場合、次のミドルウェアに進むこと', async () => {
    // テストユーザーの作成
    user = new User({
      name: 'テストユーザー',
      email: 'testuser@example.com',
      password: 'password123',
      pic: 'defaultPicUrl',
    });
    await user.save();

    // JWTトークンの生成
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const res = await request(app)
      .get('/api/test')
      .set('Authorization', `Bearer ${token}`);

    console.log('Response:', res.body); // デバッグログ

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Authorized');
    expect(res.body.user._id).toBe(user._id.toString());
  });
});
