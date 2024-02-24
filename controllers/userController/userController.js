const Users = require('../../models/userSchema');
const Profile = require('../../models/profileSchema');
const PendingUser = require('../../models/pendingUserSchema');
const Songs = require('../../models/songSchema');
const mongoose = require('mongoose');
const sendOtp = require('../../utility/sendOtp');
const verifyOtpFn = require('../../utility/verifyOtp');
const emailController = require('../commonController/emailController');

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
    const fileLoc = req.file.location;
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
    const userId = req.tockens.userId;
    const searchText = req.body.text;
    if (searchText.trim() !== '') {
      const users = await Users.find({
        _id: {$ne: userId},
        username: {$regex: searchText, $options: 'i'},
        role: {$in: ['user', 'artist']},
        deleteStatus: false,
      });
      res.status(200).json({users, userId});
    } else {
      res.status(404).json({message: 'No User Found'});
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
    } else {
      await Users.updateOne(
          {_id: userId},
          {$push: {following: followingId}},
      );
      await Users.updateOne(
          {_id: followingId},
          {$push: {followers: userId}},
      );
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
      return res.json({message: 'You are not following anyone', username});
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
    const {imageUrl} = await Profile.findOne({userId: userId});
    if (imageUrl) {
      res.json({following, followers, imageUrl});
    } else {
      res.json({following, followers});
    }
  } catch (err) {
    console.log(err);
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
    const favSongs = await Songs.find({_id: {$in: favSongIds}}).populate(
        'userId',
        'username',
    );

    return res.json({favSongs});
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Internal server error'});
  }
};

// const favAndUnfavSong = async (req, res) => {
//   const {songId} = req.body;
//   const userId = req.tockens.userId;

//   try {
//     const songExistenceChecker = await Songs.exists({_id: songId});
//     if (!songExistenceChecker) {
//       return res.status(400).json({error: 'This song doesn\'t exist'});
//     }

//     const user = await Users.findById(userId);
//     if (!user) {
//       return res.status(404).json({error: 'User not found'});
//     }

//     const index = user.favorite.indexOf(songId);
//     if (index !== -1) {
//       user.favorite.splice(index, 1);
//       await user.save();
//       return res.json({message: 'Song removed from favorites'});
//     } else {
//       user.favorite.push(songId);
//       await user.save();
//       return res.json({message: 'Song added to favorites'});
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({error: 'Internal Server Error'});
//   }
// };

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
};
