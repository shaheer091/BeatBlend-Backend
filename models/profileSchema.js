const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  imageUrl: {
    type: String,
  },
  bio: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  dateOfBirth: {
    type: String,
  },
  gender: {
    type: String,
  },
});

const userProfile = mongoose.model('userProfile', profileSchema);
module.exports = userProfile;
