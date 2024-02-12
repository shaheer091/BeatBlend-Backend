const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
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
    type: Date,
  },
  gender: {
    type: String,
  },
});

const userProfile = mongoose.model('userProfile', profileSchema);
module.exports = userProfile;
