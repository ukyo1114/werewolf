const mongoose = require('mongoose');
const connectDB = require('../../config/db');
const dotenv = require('dotenv');

jest.mock('mongoose');
jest.mock('dotenv');

describe('connectDB関数のテスト', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('データベース接続に成功した場合、ログが出力されること', async () => {
    process.env.MONGO_URI = 'mongodb://localhost/testdb';
    mongoose.connect.mockResolvedValueOnce();

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB Connected: localhost');

    consoleLogSpy.mockRestore();
  });

  it('データベース接続に失敗した場合、エラーメッセージが出力され、プロセスが終了すること', async () => {
    const errorMessage = 'Connection error';
    mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    await connectDB();

    expect(consoleErrorSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

it('環境変数が設定されていない場合、エラーが発生すること', async () => {
  delete process.env.MONGO_URI;
  mongoose.connect.mockResolvedValueOnce();

  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

  await connectDB();

  expect(consoleErrorSpy).toHaveBeenCalled();
  expect(processExitSpy).toHaveBeenCalledWith(1);

  consoleErrorSpy.mockRestore();
  processExitSpy.mockRestore();
});
});
