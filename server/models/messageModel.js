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
      maxlength: 300,
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
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);
const Message = mongoose.model("Message", messageModel);
module.exports = Message;
