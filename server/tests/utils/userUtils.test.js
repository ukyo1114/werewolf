jest.mock("@aws-sdk/client-s3", () => {
  const s3SendMock = jest.fn();
  return {
    S3Client: jest.fn(() => ({
      send: s3SendMock,
    })),
    PutObjectCommand: jest.fn(),
    __s3SendMock: s3SendMock, // テスト内で使用するためにエクスポート
  };
});

const { __s3SendMock  } = require("@aws-sdk/client-s3");
const User = require("../../models/userModel");
const { uploadPicture, getUserById, matchPassword } = require("../../utils/userUtils");
const CustomError = require("../../classes/CustomError");
const { errors } = require("../../messages");

jest.mock("../../models/userModel");

describe('uploadPicture', () => {
  beforeAll(() => {
    // 環境変数の設定
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_ACCESS_KEY_ID = 'fakeAccessKeyId';
    process.env.AWS_SECRET_ACCESS_KEY = 'fakeSecretAccessKey';
    process.env.S3_BUCKET_NAME = 'fake-bucket-name';
  });

  afterEach(() => {
    jest.clearAllMocks();
    __s3SendMock.mockReset();
  });

  it('正常系: 画像がアップロードされ、正しいURLが返される', async () => {
    const userId = 'user123';
    const pic = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';

    // S3.sendが成功するようにモック
    __s3SendMock.mockResolvedValue({});

    const expectedUrl = `https://fake-bucket-name.s3.us-west-2.amazonaws.com/user-icons/${userId}_profile.jpeg`;

    const result = await uploadPicture(userId, pic);

    // PutObjectCommandが正しく呼び出されたか確認
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'fake-bucket-name',
      Key: `user-icons/${userId}_profile.jpeg`,
      Body: Buffer.from(pic.replace(/^data:image\/\w+;base64,/, ""), "base64"),
      ContentType: "image/jpeg",
      CacheControl: "no-cache",
    });

    // S3.sendが正しく呼び出されたか確認
    expect(__s3SendMock).toHaveBeenCalledTimes(1);

    // 結果が正しいURLか確認
    expect(result).toBe(expectedUrl);
  });

  it('異常系: 画像が提供されていない場合、CustomErrorがスローされる', async () => {
    const userId = 'user123';
    const pic = null;

    await expect(uploadPicture(userId, pic)).rejects.toThrowError(new CustomError(400, errors.IMAGE_MISSING));

    // S3.sendが呼び出されていないことを確認
    expect(__s3SendMock).not.toHaveBeenCalled();
  });

  it('異常系: S3アップロード中にエラーが発生した場合、CustomErrorがスローされる', async () => {
    const userId = 'user123';
    const pic = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...';

    // S3.sendがエラーをスローするようにモック
    __s3SendMock.mockRejectedValue(new Error('S3 Upload Failed'));

    await expect(uploadPicture(userId, pic)).rejects.toThrowError(new CustomError(500, errors.SERVER_ERROR));

    // S3.sendが正しく呼び出されたか確認
    expect(__s3SendMock).toHaveBeenCalledTimes(1);
  });
});

describe('getUserById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常系: ユーザーが見つかり、パスワードも含まれる場合', async () => {
    const userId = 'user123';
    const mockUser = { _id: userId, username: 'testuser', password: 'hashedpassword' };

    User.findById.mockResolvedValue(mockUser);

    const result = await getUserById(userId, true);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(result).toBe(mockUser);
  });

  it('正常系: ユーザーが見つかり、パスワードを除外する場合', async () => {
    const userId = 'user123';
    const mockUser = { _id: userId, username: 'testuser' };

    const selectMock = jest.fn().mockResolvedValue(mockUser);

    User.findById.mockReturnValue({
      select: selectMock,
    })

    const result = await getUserById(userId, false);

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(User.findById().select).toHaveBeenCalledWith("-password");
    expect(result).toBe(mockUser);
  });

  it('異常系: ユーザーが見つからない場合、CustomErrorがスローされる', async () => {
    const userId = 'nonexistentUser';

    User.findById.mockResolvedValue(null);

    await expect(getUserById(userId, true)).rejects.toThrowError(new CustomError(404, errors.USER_NOT_FOUND));

    expect(User.findById).toHaveBeenCalledWith(userId);
  });
});

describe('matchPassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正常系: ユーザーが存在し、パスワードが一致する場合', async () => {
    const userId = 'user123';
    const password = 'correctPassword';
    const mockUser = {
      _id: userId,
      password: 'hashedpassword',
      matchPassword: jest.fn().mockResolvedValue(true),
    };

    const selectMock = jest.fn().mockReturnValue(Promise.resolve(mockUser));

    User.findById.mockReturnValue({
      select: selectMock,
    });

    await expect(matchPassword(userId, password)).resolves.toBeUndefined();

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(selectMock).toHaveBeenCalledWith('password');
    expect(mockUser.matchPassword).toHaveBeenCalledWith(password);
  });

  it('異常系: ユーザーが存在しない場合、CustomErrorがスローされる', async () => {
    const userId = 'nonexistentUser';
    const password = 'anyPassword';

    const selectMock = jest.fn().mockReturnValue(Promise.resolve(null));

    User.findById.mockReturnValue({
      select: selectMock,
    });

    await expect(matchPassword(userId, password)).rejects.toThrowError(new CustomError(404, errors.USER_NOT_FOUND));

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(selectMock).toHaveBeenCalledWith('password');
  });

  it('異常系: パスワードが一致しない場合、CustomErrorがスローされる', async () => {
    const userId = 'user123';
    const password = 'wrongPassword';
    const mockUser = {
      _id: userId,
      password: 'hashedpassword',
      matchPassword: jest.fn().mockResolvedValue(false),
    };

    const selectMock = jest.fn().mockReturnValue(Promise.resolve(mockUser));

    User.findById.mockReturnValue({
      select: selectMock,
    });

    await expect(matchPassword(userId, password)).rejects.toThrowError(new CustomError(401, errors.INVALID_PASSWORD));

    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(selectMock).toHaveBeenCalledWith('password');
    expect(mockUser.matchPassword).toHaveBeenCalledWith(password);
  });
});
