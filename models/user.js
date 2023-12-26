const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required:true,
  },
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the 'User' model
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      },
  },],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group", // Reference to the 'Group' model
  },],
});

const User = mongoose.model("user", userSchema);

module.exports = User;
