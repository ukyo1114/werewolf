const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const channelModel = mongoose.Schema(
  {
    channelName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 2000,
    },
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
    password: {
      type: String,
      maxlength: 20,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    blockUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

/* channelModel.virtual("hasPassword").get(function () {
  return !!this.password;
}); */

channelModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

channelModel.pre("validate", function (next) {
  if (this.password === "") this.password = null;
  
  next();
});

channelModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  this.hasPassword = Boolean(this.password);

  if (this.password === null) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Channel = mongoose.model("Channel", channelModel);

module.exports = Channel;
