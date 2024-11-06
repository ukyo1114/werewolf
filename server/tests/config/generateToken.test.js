const jwt = require('jsonwebtoken');
const generateToken = require('../../config/generateToken');

describe('generateToken関数のテスト', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // 環境変数の変更を反映させるため
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv; // 環境変数を元に戻す
  });

  it('有効なidを渡したときにトークンが生成されること', () => {
    process.env.JWT_SECRET = 'testsecret';
    const userId = 'user123';

    const token = generateToken(userId);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('生成されたトークンが正しいペイロードを含んでいること', () => {
    process.env.JWT_SECRET = 'testsecret';
    const userId = 'user123';

    const token = generateToken(userId);

    // トークンを検証・デコード
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toHaveProperty('id', userId);
    expect(decoded).toHaveProperty('iat'); // 発行日時
    expect(decoded).toHaveProperty('exp'); // 有効期限
  });

  it('トークンの有効期限が30日後に設定されていること', () => {
    process.env.JWT_SECRET = 'testsecret';
    const userId = 'user123';

    const now = Math.floor(Date.now() / 1000); // 現在時刻（秒単位）
    const token = generateToken(userId);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const expectedExp = now + 30 * 24 * 60 * 60; // 30日後
    const expDiff = decoded.exp - expectedExp;

    // 数秒の誤差を許容
    expect(Math.abs(expDiff)).toBeLessThan(5);
  });

  it('JWT_SECRETが未設定の場合、エラーが発生すること', () => {
    delete process.env.JWT_SECRET;
    const userId = 'user123';

    expect(() => {
      generateToken(userId);
    }).toThrowError('secretOrPrivateKey must have a value');
  });

  it('idが未定義の場合、エラーが発生すること', () => {
    process.env.JWT_SECRET = 'testsecret';

    try {
      generateToken();
    } catch (error) {
      expect(error.message).toMatch(/jwt subject must be provided/);
    }
  });
});
