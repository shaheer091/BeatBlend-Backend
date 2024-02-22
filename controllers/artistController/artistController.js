const mongoose = require('mongoose');
const Songs = require('../../models/songSchema');
const User = require('../../models/userSchema');
const Profile = require('../../models/profileSchema');

const addSong = async (req, res) => {
  try {
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
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const songs = await Songs.aggregate([{$match: {userId: userId}}]);
    let username;
    if (songs.length > 0) {
      const user = await User.findOne(userId);
      username = user.username;
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
    const songId = req.params.id;
    await Songs.findByIdAndDelete(songId);
    res.json({message: 'song deleted succesfully'});
  } catch (err) {
    console.log(err);
    res.json({err});
  }
};
const getProfile = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.tockens.userId);
  const user = await User.findOne({_id: userId});
  const artistProfile = await User.aggregate([
    {$match: {_id: userId}},
    {
      $lookup: {
        from: 'userprofiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },
  ]);
  res.json({artistProfile, user});
};

const updateProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const {username, email, bio, phoneNumber, dateOfBirth, file} =
      req.body.profileDetails;
    const existingUser = await User.findOne({username: username});
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      res.json({message: 'This username is already taken', success: false});
    } else {
      await User.updateOne(
          {_id: userId},
          {
            $set: {
              username,
              email,
            },
          },
          {upsert: true},
      );
      await Profile.updateOne(
          {userId: userId},
          {
            $set: {
              imageUrl: file,
              bio,
              phoneNumber,
              dateOfBirth,
            },
          },
          {upsert: true},
      );
      res
          .status(200)
          .json({message: 'Profile updated successfully', success: true});
    }
  } catch (err) {
    res.status(500).json({message: 'Error Updating Profile', success: false});
    console.log(err);
  }
};

module.exports = {
  addSong,
  getSong,
  deleteSong,
  getProfile,
  updateProfile,
};
