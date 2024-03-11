const mongoose = require('mongoose');
const Songs = require('../models/songSchema');
const User = require('../models/userSchema');
const Profile = require('../models/profileSchema');
const Band = require('../models/bandSchema');
// const emailSending = require('../utility/emailController');

const addSong = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const {title, artist, album, genre, duration, releaseDate} = req.body;
    const songUrl = req.file.location;
    if (!title || !genre || !songUrl) {
      return res.json({message: 'Enter the required fields'});
    } else {
      const defaultReleaseDate = releaseDate ?
        releaseDate :
        new Date().toISOString();

      const newSong = new Songs({
        userId: userId,
        title,
        songUrl: songUrl,
        artist,
        album,
        genre,
        duration,
        releaseDate: defaultReleaseDate,
      });
      await newSong.save();
      res.json({
        message: 'Song Added Succesfully',
        success: true,
        description: 'Your song has been uploaded and added to the system.',
      });
    }
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
    const song = await Songs.findById(songId);

    if (!song) {
      return res.status(404).json({error: 'Song not found'});
    }

    // Toggle the deleteStatus field
    song.deleteStatus = !song.deleteStatus;
    await song.save();

    if (song.deleteStatus) {
      res.json({message: 'Song deleted successfully'});
    } else {
      res.json({message: 'Song undeleted successfully'});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal Server Error'});
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

const getSongDetails = async (req, res) => {
  try {
    const songId = new mongoose.Types.ObjectId(req.params.id);
    const song = await Songs.findOne({_id: songId});
    res.json(song);
  } catch (err) {
    console.log(err);
  }
};

const editSongDetails = async (req, res) => {
  try {
    const songId = new mongoose.Types.ObjectId(req.params.id);
    const {title, artist, album, genre, duration} = req.body;
    await Songs.updateOne(
        {_id: songId},
        {
          $set: {
            title,
            artist,
            album,
            genre,
            duration,
          },
        },
    );
    res.json({message: 'Song Updated Successfully'});
  } catch (err) {
    console.log(err);
  }
};

const getHome = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const artist = await User.aggregate([
      {$match: {_id: userId}},
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: 'userId',
          as: 'songs',
        },
      },
    ]);
    res.json(artist);
  } catch (err) {
    console.log(err);
  }
};

const getArtist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const artistName = req.params.searchText;
    const artists = await User.find({
      _id: {$ne: userId},
      username: {$regex: artistName, $options: 'i'},
      deleteStatus: false,
      role: 'artist',
      isVerified: true,
    });

    if (artists && artists.length > 0) {
      return res.json({artists});
    } else {
      return res.json({artists: []});
    }
  } catch (error) {
    console.error('Error while fetching artists:', error);
    return res.status(500).json({error: 'Internal server error'});
  }
};

const createBand = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const file = req?.file?.location;
    const {bandName, artistid} = req.body;

    // Loop through each artistid
    for (const id of artistid) {
      const newBand = new Band({
        bandName,
        bandAdmin: userId,
        requestedMembers: [id],
        bandImage: file,
      });
      await newBand.save();
      const user = await User.findById(id);
      console.log(user);
      // await emailSending.requestBandJoin(user.email);
    }
    res.json({
      message: 'Requests sent to the artists. Wait for their confirmation',
    });
  } catch (err) {
    console.log(err);
  }
};

const acceptBandInvitation = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const bandId = req.body.bandId;
    const band = await Band.findByIdAndUpdate(
        bandId,
        {
          $pull: {requestedMembers: userId},
          $push: {bandMembers: userId},
        },
        {new: true},
    );
    if (band) {
      console.log(band);
      res.json({message: 'Band invitation accepted successfully.'});
    } else {
      res.status(404).json({message: 'Band not found.'});
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addSong,
  getSong,
  deleteSong,
  getProfile,
  updateProfile,
  getSongDetails,
  editSongDetails,
  getHome,
  getArtist,
  createBand,
  acceptBandInvitation,
};
