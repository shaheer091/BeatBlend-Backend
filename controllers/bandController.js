const mongoose = require('mongoose');
const Users = require('../models/userSchema');
const Bands = require('../models/bandSchema');
const Profile = require('../models/profileSchema');
const Songs = require('../models/songSchema');
// const Playlist = require('../models/playlistSchema');

const getBandHome = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.tockens.userId);
  const band = await Users.aggregate([
    {
      $match: {_id: userId},
    },
    {
      $lookup: {
        from: 'bands',
        localField: 'bandId',
        foreignField: '_id',
        as: 'band',
      },
    },
  ]);
  res.json(band);
};

const addSong = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const {title, album, genre, duration, releaseDate} = req.body;
    const songUrl = req.file.location;
    const user = await Users.findById(userId);
    const band = await Bands.findById(user.bandId);
    if (!title || !genre || !songUrl) {
      return res.json({message: 'Enter the required fields'});
    } else {
      const defaultReleaseDate = releaseDate ?
        releaseDate :
        new Date().toISOString();

      const newSong = new Songs({
        userId: band._id,
        title,
        songUrl: songUrl,
        artist: band.bandName,
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

const getBandMembers = async (req, res) => {
  const {userId} = req.tockens;
  const user = await Users.findById(userId);
  const band = await Bands.aggregate([
    {
      $match: {_id: user.bandId},
    },
    {
      $lookup: {
        from: 'users',
        localField: 'bandAdmin',
        foreignField: '_id',
        as: 'bandAdmin',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'bandMembers',
        foreignField: '_id',
        as: 'bandMembers',
      },
    },
  ]);
  res.json({band});
};

const removeFromBand = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const removerId = req.body.userId;
    if (!userId || !removerId) {
      return res
          .status(400)
          .json({message: 'Both userId and removerId are required.'});
    }
    const user = await Users.findById(userId);
    const band = await Bands.findById(user.bandId);
    if (userId !== String(band.bandAdmin)) {
      return res.status(403).json({
        message: 'You cannot perform this task. You are not the admin.',
      });
    }
    const indexToRemove = band.bandMembers.indexOf(removerId);
    if (indexToRemove === -1) {
      return res
          .status(404)
          .json({message: 'Remover ID not found in band members.'});
    }
    band.bandMembers.splice(indexToRemove, 1);
    await band.save();
    return res.json({
      message: 'Remover ID removed from band members successfully.',
    });
  } catch (error) {
    console.error('Error removing remover ID from band members:', error);
    return res.status(500).json({message: 'Internal server error.'});
  }
};

const searchArtist = async (req, res) => {
  const userId = req.tockens.userId;
  const user = await Users.findById(userId);
  const band = await Bands.findById(user.bandId);
  const searchText = req.params.searchText;
  try {
    const artists = await Users.find({
      _id: {$ne: band.bandMembers},
      _id: {$ne: userId},
      username: {$regex: searchText, $options: 'i'},
      deleteStatus: false,
      role: 'artist',
      isVerified: true,
    });
    if (artists && artists.length > 0) {
      return res.json({artists});
    } else {
      return res.json({artists: []});
    }
  } catch (err) {
    console.log(err);
  }
};

const addToBand = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const {artistId} = req.body;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    const band = await Bands.findById(user.bandId);
    if (!band) {
      return res.status(404).json({message: 'Band not found'});
    }
    if (userId !== String(band.bandAdmin)) {
      return res.status(403).json({
        message: 'You cannot perform this task. You are not the admin.',
      });
    }
    if (band.bandMembers.includes(artistId)) {
      return res
          .status(409)
          .json({message: 'Artist is already a band member'});
    }
    if (
      band.requestedMembers.some((memberId) => memberId.toString() === artistId)
    ) {
      return res.status(409).json({message: 'Artist already requested'});
    }
    band.requestedMembers.push(artistId);
    await band.save();
    res.status(200).json({message: 'Artist successfully requested'});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  }
};

const getSongs = async (req, res) => {
  try {
    const userId = req.tockens?.userId;
    if (!userId) {
      return res.status(400).json({error: 'User ID is missing'});
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const bandId = user.bandId;
    if (!bandId) {
      return res.status(400).json({error: 'Band ID is missing'});
    }

    const band = await Bands.findById(bandId);
    if (!band) {
      return res.status(404).json({error: 'Band not found'});
    }

    const songs = await Songs.find({userId: band._id});
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

const getSingleSong = async (req, res) => {
  try {
    const songId = req.params.id;
    if (!songId) {
      return res.status(400).json({message: 'Missing song ID'});
    }
    const song = await Songs.findById(songId);

    if (!song) {
      return res.status(404).json({message: 'Song not found'});
    }
    res.status(200).json(song);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  }
};

const editSong = async (req, res) => {
  try {
    const {title, album, genre, duration} = req.body;
    const songId = req.params.id;
    const updatedSong = await Songs.updateOne(
        {_id: songId},
        {
          $set: {
            title,
            album,
            genre,
            duration,
          },
        },
    );
    if (updatedSong) {
      res.status(200).json({
        message: 'Song updated successfully',
        discription: 'The song has been updated.',
        success: true,
      });
    }
  } catch (error) {
    console.error('Error editing song:', error);
    res.status(500).json({message: 'Internal server error'});
  }
};

const getBandProfile = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const band = await Bands.find({
      $or: [{bandAdmin: userId}, {bandMembers: userId}],
    });
    res.json(band);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  }
};

const addProfile = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const {bandName, bandBio, bandLocation} = req.body;
    // if (!req.file || !req.file.location) {
    //   return res.status(400).json({message: 'Band image file is missing'});
    // }
    const fileLoc = req?.file?.location;
    const band = await Bands.findOne({bandAdmin: userId});
    if (!band) {
      return res
          .status(404)
          .json({
            message: 'Band not found or You are not the admin of this Band.',
          });
    }
    await Bands.updateOne(
        {_id: band._id},
        {
          $set: {
            bandImage: fileLoc,
            bandName,
            bandBio,
            bandLocation,
          },
        },
        {upsert: true},
    );
    return res
        .status(200)
        .json({message: 'Band profile updated successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({message: 'Internal server error'});
  }
};

module.exports = {
  getBandHome,
  addSong,
  getBandMembers,
  removeFromBand,
  searchArtist,
  addToBand,
  getSongs,
  getSingleSong,
  editSong,
  addProfile,
  getBandProfile,
};
