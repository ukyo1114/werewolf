const mongoose = require("mongoose");

const channelModel = mongoose.Schema(
  {
    channelName: { type: String, trim: true },
    description: { type: String, trim: true },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    channelAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Channel = mongoose.model("Channel", channelModel);

module.exports = Channel;
