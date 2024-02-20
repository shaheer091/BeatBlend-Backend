const mongoose = require('mongoose');
const Songs = require('../../models/songSchema');
const User = require('../../models/userSchema');

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

const getSong = async (req, res) => {
  try {
    console.log('inside getsong ');
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    // console.log(userId);
    const songs = await Songs.aggregate([{$match: {userId: userId}}]);
    // console.log(songs);
    let username;
    if (songs.length>0) {
      const user = await User.findOne(userId);
      // console.log(user);
      username = user.username;
    // console.log(username);
    }
    if (songs.length > 0) {
      res.json({songs, message: 'songs found', success: true, username});
    } else {
      res.json({message: 'No Songs Found', success: false});
    }
  } catch (err) {
    console.log(err);
  }
};

const deleteSong = async (req, res) => {
  try {
    console.log('delete clicked');
    console.log(req.params.id);
    const songId = req.params.id;
    await Songs.findByIdAndDelete(songId);
    res.json({message: 'song deleted succesfully'});
  } catch (err) {
    console.log(err);
    res.json({err});
  }
};


module.exports = {
  addSong,
  getSong,
  deleteSong,
};
