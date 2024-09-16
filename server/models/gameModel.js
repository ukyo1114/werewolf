const mongoose = require("mongoose");

const gameModel = mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    result: {
      type: String,
      enum: ["running", "villagersWin", "werewolvesWin", "villageAbandoned"],
      default: "running",
    },
  },
  { timestamps: true },
);

const Game = mongoose.model("Game", gameModel);

module.exports = Game;
