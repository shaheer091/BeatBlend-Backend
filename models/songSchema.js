const mongoose = require('mongoose');
const songSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  title: {
    type: String,
    required: true,
  },
  songUrl: {
    type: String,
    required: true,
  },
  deleteStatus: {
    type: Boolean,
    default: false,
  },
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
  genre: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  releaseDate: {
    type: String,
    default: new Date(),
  },
});
const song = mongoose.model('songs', songSchema);
module.exports=song;
