const Users = require('../models/userSchema');
const Profile = require('../models/profileSchema');
const PendingUser = require('../models/pendingUserSchema');
const Songs = require('../models/songSchema');
const Playlist = require('../models/playlistSchema');
const mongoose = require('mongoose');
const sendOtp = require('../utility/sendOtp');
const verifyOtpFn = require('../utility/verifyOtp');
const emailController = require('../utility/emailController');

const getProfile = async (req, res) => {
  try {
    const userProfile = await Users.aggregate([
      {$match: {_id: new mongoose.Types.ObjectId(req.tockens.userId)}},
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'userDetails',
        },
      },
    ]);
    res.json({userProfile});
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const {bio, phoneNumber, date, gender, username, email} = req.body;
    const fileLoc = req.file?.location;
    await Profile.updateOne(
        {userId: req.tockens.userId},
        {
          $set: {
            imageUrl: fileLoc,
            bio,
            phoneNumber,
            dateOfBirth: date,
            gender,
          },
        },
    );
    await Users.updateOne(
        {_id: req.tockens.userId},
        {
          $set: {
            username,
            email,
          },
        },
    );
    res.json({message: 'Profile updated successfully'});
  } catch (error) {
    console.log(error);
    res.json({message: 'Profile updation failed'});
  }
};

const verifyPhone = async (req, res) => {
  try {
    const phoneNumber = req.body.phone;
    await sendOtp(phoneNumber);
    res.status(200).json({message: 'OTP sent successfully'});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({message: 'Failed to send OTP'});
  }
};

const verifyOtp = async (req, res) => {
  const phone = req.body.phone;
  const otp = req.body.otp;
  try {
    const status = verifyOtpFn(phone, otp);
    if (!status == 'approved') {
      res.json({message: 'OTP verification failed'});
    } else {
      res.json({message: 'OTP is verified succesfully'});
    }
  } catch (err) {
    console.log(err);
  }
};

const verifyUser = async (req, res) => {
  try {
    const socialMediaLink = req.body.socialMediaLink;

    if (!socialMediaLink) {
      throw Object.assign(new Error('Please enter social media link!'), {
        statusCode: 202,
      });
    }

    const userId = req.tockens.userId;

    const user = await Users.findOne({_id: userId});

    if (!user) {
      throw new Error('Failed to get user details with provided id!');
    }

    const pendingUser = new PendingUser({
      userId: user._id,
      username: user.username,
      email: user.email,
      socialMediaLink: socialMediaLink,
      role: user.role,
      isVerified: false,
      deleteStatus: false,
    });

    await pendingUser.save();

    await emailController.requestApproval(user.email);
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'An errro occured! please try later',
      data: [],
      err,
    });
  }
};

const search = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const searchText = req.params.text;
    if (searchText !== '') {
      // const users = await Users.find({
      //   _id: {$ne: userId},
      //   username: {$regex: searchText, $options: 'i'},
      //   role: {$in: ['user', 'artist']},
      //   deleteStatus: false,
      // });
      const users = await Users.aggregate([
        {
          $match: {
            _id: {$ne: userId},
            username: {$regex: searchText, $options: 'i'},
            role: {$in: ['user', 'artist']},
            deleteStatus: false,
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: '_id',
            foreignField: 'userId',
            as: 'profile',
          },
        },
      ]);
      if (users) {
        res.status(200).json({users, userId});
      } else {
        res.json({message: 'No users Found'});
      }
    } else {
      res.status(404).json({message: 'No User Found', users: []});
    }
  } catch (err) {
    console.log(err);
  }
};

const followAndUnfollowUser = async (req, res) => {
  try {
    const followingId = req.body.userId;
    const userId = req.tockens.userId;

    const user = await Users.findOne({_id: userId, following: followingId});

    if (user) {
      await Users.updateOne(
          {_id: userId},
          {$pull: {following: followingId}},
      );
      await Users.updateOne(
          {_id: followingId},
          {$pull: {followers: userId}},
      );
      res.json({message: 'user unfollowed successfully'});
    } else {
      await Users.updateOne(
          {_id: userId},
          {$push: {following: followingId}},
      );
      await Users.updateOne(
          {_id: followingId},
          {$push: {followers: userId}},
      );
      res.json({message: 'user followed successfully'});
    }
  } catch (err) {
    console.log(err);
  }
};

const getSong = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const user = await Users.findOne({_id: userId});
    const {username, following} = user;

    if (!following || following.length === 0) {
      return res.json({message: 'Nothing to display', username});
    } else {
      const aggregatedSongs = await Songs.aggregate([
        {
          $match: {
            userId: {$in: following},
            deleteStatus: false,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'artist',
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'artist._id',
            foreignField: 'userId',
            as: 'artistProfiles',
          },
        },
        {
          $sort: {
            releaseDate: -1,
          },
        },
      ]);
      return res.json({songs: aggregatedSongs, username});
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Internal server error'});
  }
};

const getSettings = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const {following, followers} = await Users.findOne({_id: userId});
    const profile = await Profile.findOne({userId: userId});
    let imageUrl;
    if (profile) {
      imageUrl = profile.imageUrl;
    }

    if (imageUrl) {
      res.json({following, followers, imageUrl});
    } else {
      res.json({following, followers});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Internal server error'});
  }
};

const favAndUnfavSong = async (req, res) => {
  const {songId} = req.body;
  const userId = req.tockens.userId;

  try {
    const songExistenceChecker = await Songs.exists({_id: songId});
    if (!songExistenceChecker) {
      return res.status(400).json({error: 'This song doesn\'t exist'});
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const index = user.favorite.indexOf(songId);
    if (index !== -1) {
      user.favorite.splice(index, 1);
      await user.save();
      return res.json({message: 'Removed from favorites', fav: false});
    } else {
      user.favorite.push(songId);
      await user.save();
      return res
          .status(200)
          .json({message: 'Song favorited successfully', fav: true});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: 'Internal Server Error'});
  }
};

const getFavSongs = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const user = await Users.findOne({_id: userId});
    const favSongIds = user.favorite;
    if (favSongIds.length === 0) {
      return res.json({message: 'You havenot favorited anything'});
    }
    const favSongs = await Songs.find({
      _id: {$in: favSongIds},
      deleteStatus: false,
    }).populate('userId', 'username');

    return res.json({favSongs});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Internal server error'});
  }
};

const searchSong = async (req, res) => {
  try {
    const searchText = req.params.searchText;
    const songs = await Songs.find({
      title: {$regex: searchText, $options: 'i'},
      deleteStatus: false,
    }).populate('userId', 'username');
    if (searchText != '') {
      if (!songs || songs.length == 0) {
        return res.json({songs: []});
      } else {
        return res.json({songs});
      }
    } else {
      res.json({songs: []});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
};

const createPlaylist = async (req, res) => {
  try {
    const {songIds, playlistName} = req.body;
    if (req.file) {
      playlistImage = req.file.location;
    }
    const newPlaylist = new Playlist({
      userId: req.tockens.userId,
      songId: songIds,
      playlistName,
      imageUrl: req?.file?.location,
    });

    try {
      await newPlaylist.save();
      res.status(200).json({message: 'Playlist created successfully'});
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({error: 'Internal server error'});
    }
  } catch (err) {
    console.log(err);
  }
};

const getPlaylist = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const playlist = await Playlist.find({userId});
    if (!playlist) {
      return res.json({message: 'No playlist Found'});
    } else {
      res.json(playlist);
    }
  } catch (err) {
    console.log(err);
  }
};

const getSinglePlaylist = async (req, res) => {
  try {
    const playlistId = new mongoose.Types.ObjectId(req.params.id);
    const playlist = await Playlist.aggregate([
      {$match: {_id: playlistId}},
      {
        $lookup: {
          from: 'songs',
          localField: 'songId',
          foreignField: '_id',
          as: 'songs',
        },
      },
      {
        $unwind: '$songs',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'songs.userId',
          foreignField: '_id',
          as: 'songs.artists',
        },
      },
      {
        $group: {
          _id: '$_id',
          songs: {$push: '$songs'},
        },
      },
    ]);

    res.json(playlist);
  } catch (err) {
    console.log(err);
  }
};

const removeFromPlaylist = async (req, res) => {
  const userId = req.tockens.userId;
  const songId = new mongoose.Types.ObjectId(req.params.id);

  try {
    await Playlist.updateOne({userId: userId}, {$pull: {songId: songId}});
    res
        .status(200)
        .json({message: 'Song removed from playlist successfully'});
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const deletePlaylist = async (req, res) => {
  const playlistId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const result = await Playlist.deleteOne({_id: playlistId});
    if (result.deletedCount === 1) {
      res.status(200).json({message: 'Playlist deleted successfully'});
    } else {
      res.status(404).json({error: 'Playlist not found'});
    }
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

module.exports = {
  getProfile,
  updateProfile,
  verifyPhone,
  verifyOtp,
  verifyUser,
  search,
  followAndUnfollowUser,
  getSong,
  getSettings,
  favAndUnfavSong,
  getFavSongs,
  createPlaylist,
  searchSong,
  getPlaylist,
  getSinglePlaylist,
  removeFromPlaylist,
  deletePlaylist,
};
