const mongoose=require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  title: {
    type: String,
    required: true,
  },
  songId: {
    type: [mongoose.Types.ObjectId],
  },
  imageUrl: {
    type: String,
  },
});

module.exports=mongoose.model('Playlist', playlistSchema);
