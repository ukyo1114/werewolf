// tests/errorUtils.test.js

const { handleServerError, checkErrorMessage } = require('../../utils/handleError');
const CustomError = require('../../classes/CustomError');
const { errors } = require('../../messages');

describe('errorUtils 関数のテスト', () => {
  // 1. handleServerError のテスト
  describe('handleServerError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('エラーが発生した場合、console.error が呼ばれ、CustomError がスローされること', () => {
      const error = new Error('Test error');

      expect(() => {
        handleServerError(error);
      }).toThrowError(new CustomError(500, errors.SERVER_ERROR));

      expect(console.error).toHaveBeenCalledWith('error:', error.message);
    });

    it('error が null の場合、適切にエラーハンドリングされること', () => {
      expect(() => {
        handleServerError(null);
      }).toThrowError(new CustomError(500, errors.SERVER_ERROR));

      expect(console.error).toHaveBeenCalledWith('error:', undefined);
    });

    it('error が undefined の場合、適切にエラーハンドリングされること', () => {
      expect(() => {
        handleServerError(undefined);
      }).toThrowError(new CustomError(500, errors.SERVER_ERROR));

      expect(console.error).toHaveBeenCalledWith('error:', undefined);
    });
  });

  // 2. checkErrorMessage のテスト
  describe('checkErrorMessage', () => {
    it('error.message が errorMessage と一致する場合、CustomError がスローされること', () => {
      const errorMessage = 'Specific error message';
      const error = new Error(errorMessage);

      expect(() => {
        checkErrorMessage(error, errorMessage);
      }).toThrowError(new CustomError(400, errorMessage));
    });

    it('error.message が errorMessage と一致しない場合、エラーがスローされないこと', () => {
      const error = new Error('Different error message');
      const errorMessage = 'Specific error message';

      expect(() => {
        checkErrorMessage(error, errorMessage);
      }).not.toThrow();
    });

    it('error が null の場合、何も起こらないこと', () => {
      expect(() => {
        checkErrorMessage(null, 'Some error message');
      }).not.toThrow();
    });

    it('errorMessage が null の場合、何も起こらないこと', () => {
      const error = new Error('Test error');

      expect(() => {
        checkErrorMessage(error, null);
      }).not.toThrow();
    });

    it('error と errorMessage が両方 null の場合、何も起こらないこと', () => {
      expect(() => {
        checkErrorMessage(null, null);
      }).not.toThrow();
    });
  });
});
