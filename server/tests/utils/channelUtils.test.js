const mongoose = require('mongoose');
const Channel = require('../../models/channelModel');
const CustomError = require('../../classes/CustomError');
const { errors } = require('../../messages');
const {
  getChannelById,
  isChannelAdmin,
  isUserBlocked,
} = require('../../utils/channelUtils');

jest.mock('../../models/channelModel');

describe('channelController 関数のテスト', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChannelById', () => {
    it('有効な channelId を渡した場合、チャンネルが取得されること', async () => {
      const channelId = 'channel123';
      const mockChannel = {
        _id: channelId,
        name: 'Test Channel',
        password: 'secret',
      };

      // password=true の場合、findById が直接チャンネルを返す
      Channel.findById.mockResolvedValue(mockChannel);

      const channel = await getChannelById(channelId);

      expect(Channel.findById).toHaveBeenCalledWith(channelId);
      expect(channel).toEqual(mockChannel);
    });

    it('password が false の場合、チャンネル情報からパスワードが除外されること', async () => {
      const channelId = 'channel123';
      const mockChannelWithoutPassword = {
        _id: channelId,
        name: 'Test Channel',
      };

      // password=false の場合、findById が select メソッドを持つオブジェクトを返す
      Channel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockChannelWithoutPassword),
      });

      const channel = await getChannelById(channelId, false);

      expect(Channel.findById).toHaveBeenCalledWith(channelId);
      expect(Channel.findById().select).toHaveBeenCalledWith('-password');
      expect(channel).toEqual(mockChannelWithoutPassword);
    });

    it('存在しない channelId を渡した場合、CustomError がスローされること', async () => {
      const channelId = 'invalidChannelId';

      // findById が null を返すようにモック
      Channel.findById.mockResolvedValue(null);

      await expect(getChannelById(channelId)).rejects.toThrowError(
        new CustomError(404, errors.CHANNEL_NOT_FOUND)
      );
    });

    it('データベース操作でエラーが発生した場合、エラーが適切に処理されること', async () => {
      const channelId = 'channel123';

      // findById がエラーを投げるようにモック
      Channel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getChannelById(channelId)).rejects.toThrowError('Database error');
    });
  });

  // 1. isChannelAdmin のテスト
  describe('isChannelAdmin', () => {
    it('channelAdmin が userId と一致する場合、エラーがスローされないこと', () => {
      const userId = new mongoose.Types.ObjectId();
      const channel = {
        channelAdmin: userId,
      };

      expect(() => {
        isChannelAdmin(channel, userId.toString());
      }).not.toThrow();
    });

    it('channelAdmin が userId と一致しない場合、CustomError がスローされること', () => {
      const userId = new mongoose.Types.ObjectId();
      const otherUserId = new mongoose.Types.ObjectId();
      const channel = {
        channelAdmin: otherUserId,
      };

      expect(() => {
        isChannelAdmin(channel, userId.toString());
      }).toThrowError(new CustomError(403, errors.PERMISSION_DENIED));
    });
  });

  // 2. isUserBlocked のテスト
  describe('isUserBlocked', () => {
    it('blockUsers に userId が含まれない場合、エラーがスローされないこと', () => {
      const userId = new mongoose.Types.ObjectId();
      const anotherUserId = new mongoose.Types.ObjectId();
      const channel = {
        blockUsers: [anotherUserId],
      };

      expect(() => {
        isUserBlocked(channel, userId.toString());
      }).not.toThrow();
    });

    it('blockUsers に userId が含まれる場合、CustomError がスローされること', () => {
      const userId = new mongoose.Types.ObjectId();
      const channel = {
        blockUsers: [userId],
      };

      expect(() => {
        isUserBlocked(channel, userId.toString());
      }).toThrowError(new CustomError(403, errors.USER_BLOCKED));
    });
  });
});
