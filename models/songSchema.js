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
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
  genre: {
    type: String,
  },
  duration: {
    type: Number,
  },
  releaseDate: {
    type: String,
  },
});
const song = mongoose.model('songs', songSchema);
module.exports=song;
