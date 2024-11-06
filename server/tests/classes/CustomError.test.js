// tests/CustomError.test.js

const CustomError = require('../../classes/CustomError');

describe('CustomError クラスのテスト', () => {
  
  // 正常系のテストケース
  describe('正常系', () => {
    it('正しい statusCode と message を渡してエラーオブジェクトが生成されること', () => {
      const statusCode = 404;
      const message = 'Not Found';
      const error = new CustomError(statusCode, message);
      
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.name).toBe('CustomError');
      expect(error.stack).toBeDefined();
    });
    
    it('エラーメッセージが正しく設定されていること', () => {
      const statusCode = 500;
      const message = 'Internal Server Error';
      const error = new CustomError(statusCode, message);
      
      expect(error.message).toBe(message);
    });
    
    it('name プロパティがクラス名に設定されていること', () => {
      const statusCode = 400;
      const message = 'Bad Request';
      const error = new CustomError(statusCode, message);
      
      expect(error.name).toBe('CustomError');
    });
    
    it('スタックトレースがキャプチャされていること', () => {
      const statusCode = 401;
      const message = 'Unauthorized';
      const error = new CustomError(statusCode, message);
      
      expect(error.stack).toContain('CustomError');
      expect(error.stack).toContain(message);
    });
    
    it('CustomError のインスタンスが Error のインスタンスであること', () => {
      const error = new CustomError(403, 'Forbidden');
      
      expect(error instanceof Error).toBe(true);
    });
  });
  
  // 異常系のテストケース
  describe('異常系', () => {
    it('statusCode が未定義の場合、エラーオブジェクトが生成されるが statusCode は undefined', () => {
      const message = 'Missing Status Code';
      const error = new CustomError(undefined, message);
      
      expect(error.statusCode).toBeUndefined();
      expect(error.message).toBe(message);
    });
    
    it('message が未定義の場合、エラーオブジェクトが生成されるが message は空文字列', () => {
      const statusCode = 400;
      const message = undefined;
      const error = new CustomError(statusCode, message);
      
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(''); // 修正：undefinedではなく空文字列
    });
    
    it('statusCode に数値以外の値を渡した場合、statusCode がその値に設定されること', () => {
      const statusCode = 'Not a Number';
      const message = 'Invalid Status Code';
      const error = new CustomError(statusCode, message);
      
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
    });
    
    it('message に文字列以外の値を渡した場合、message がその文字列化された値に設定されること', () => {
      const statusCode = 400;
      const message = { error: 'Bad Request' };
      const error = new CustomError(statusCode, message);
      
      expect(error.message).toBe('[object Object]'); // 修正：オブジェクトは文字列化される
    });
  });
  
  // エッジケースのテストケース
  describe('エッジケース', () => {
    it('message が空文字列の場合、エラーオブジェクトが生成されること', () => {
      const statusCode = 200;
      const message = '';
      const error = new CustomError(statusCode, message);
      
      expect(error.message).toBe(message);
    });
    
    it('非常に長い message を渡した場合、正しく設定されること', () => {
      const statusCode = 500;
      const message = 'A'.repeat(1000); // 長いメッセージ
      const error = new CustomError(statusCode, message);
      
      expect(error.message).toBe(message);
    });
  });
});
