const Songs = require('../../models/songSchema');

const addSong = async (req, res) => {
  try {
    console.log(req.body.data);
    console.log(req.tockens);
    const userId = req.tockens.userId;
    const {title, artist, album, genre, duration, releaseDate, songFile} =
      req.body.data;
    const newSong = new Songs({
      userId: userId,
      title,
      songUrl: songFile,
      artist,
      album,
      genre,
      duration,
      releaseDate,
    });
    await newSong.save();
    res.json({
      message: 'Song Added Succesfully',
      success: true,
      description: 'Your song has been uploaded and added to the system.',
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: 'Error adding Song',
      success: false,
      description:
        'There was an error uploading your song. Please try again later.',
    });
  }
};
module.exports = {
  addSong,
};
