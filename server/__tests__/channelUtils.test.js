const { isUserAdmin } = require("../utils/channelUtils");
const Channel = require("../models/channelModel");
const { errors } = require("../messages");

jest.mock("../models/channelModel", () => ({
  findById: jest.fn(),
}));

describe("isUserAdmin", () => {
  const channelId = "testChannelId";
  const userId = "testUserId";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("チャンネルが存在しない場合、404エラーを返す", async () => {
    Channel.findById.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValueOnce(null),
    });

    await expect(isUserAdmin(channelId, userId)).rejects.toMatchObject({
      statusCode: 404,
      message: errors.CHANNEL_NOT_FOUND,
    });
  });

  it("ユーザーが管理者でない場合、falseを返す", async () => {
    Channel.findById.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValueOnce({
        channelAdmin: "otherUserId",
      }),
    });

    await expect(isUserAdmin(channelId, userId)).resolves.toMatchObject({
      isChAdmin: false,
    });
  });

  it("ユーザーが管理者である場合、trueを返す", async () => {
    Channel.findById.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValueOnce({
        channelAdmin: "testUserId",
      }),
    });
    await expect(isUserAdmin(channelId, userId)).resolves.toMatchObject({
      isChAdmin: true,
    });
  });
});