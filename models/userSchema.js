const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  isPremium: {
    type: Boolean,
    required: true,
    default: false,
  },
  following: {
    type: [mongoose.Types.ObjectId],
  },
  followers: {
    type: [mongoose.Types.ObjectId],
  },
  favorite: {
    type: [mongoose.Types.ObjectId],
  },
  dateCreated: {
    type: Date,
    required: true,
    default: new Date(),
  },
  deleteStatus: {
    type: Boolean,
    required: true,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    dafault: false,
  },
  likedSongs: {
    type: [mongoose.Types.ObjectId],
  },
});

const user = mongoose.model('User', userSchema);

module.exports = user;
