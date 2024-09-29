const { errors } = require('../messages');
const CustomError = require('../classes/CustomError');
const getGamesByChannelId = require('../utils/spectatorUtils');

const getGameList = (req, res) => {
  const channelId = req.params.channelId;
  if (!channelId) throw new CustomError(400, errors.CHANNEL_ID_MISSING);

  try {
    const gameList = getGamesByChannelId(channelId);
    res.status(200).json(gameList);
  } catch (error) {
    throw new CustomError(500, errors.SERVER_ERROR);
  }
};

module.exports = getGameList;