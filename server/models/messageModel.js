const mongoose = require("mongoose");
const messageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
    },
    messageType: {
      type: String,
      enum: ["normal", "werewolf", "spectator"],
      default: "normal",
    },
  },
  { timestamps: true },
);
const Message = mongoose.model("Message", messageModel);
module.exports = Message;
