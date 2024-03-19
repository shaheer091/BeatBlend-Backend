const mongoose = require('mongoose');
const Users = require('../models/userSchema');
const Bands = require('../models/bandSchema');
// const Profile = require('../models/profileSchema');
// const Songs = require('../models/songSchema');
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
  // console.log(req.tockens.userId);
  // console.log(req.body);
  // const songFile = req.file.location;
  // const {title, album, genre, duration, releaseDate}=req.body;
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
  const searchText = req.params.searchText;
  try {
    const artists = await Users.find({
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

module.exports = {
  getBandHome,
  addSong,
  getBandMembers,
  removeFromBand,
  searchArtist,
  addToBand,
};
