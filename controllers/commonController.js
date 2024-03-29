/* eslint-disable new-cap */
const Users = require('../models/userSchema');
// const PendingUser = require('../../models/pendingUserSchema');
const mongoose = require('mongoose');
const emailService = require('../utility/emailController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Band = require('../models/bandSchema');
const Songs = require('../models/songSchema');

const signup = async (req, res) => {
  const {username, email, password, confirmPassword} = req.body;
  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({message: 'Enter your details'});
  }
  const existingUser = await Users.findOne({
    $or: [{email}, {username}],
  });
  if (existingUser) {
    if (existingUser.email === email) {
      return res
          .status(200)
          .json({message: 'User with this email already exists'});
    } else if (existingUser.username === username) {
      return res
          .status(200)
          .json({message: 'User with this username already exists'});
    }
  } else {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await emailService.sendOtp(email, otp);
      res.status(200).json({message: 'OTP is successfully sent', otp});
    } catch (error) {
      res.status(500).json({error: 'Internal Server error'});
    }
  }
};

const otpVerify = async (req, res) => {
  const {sendedotp, enteredotp} = req.body;

  if (String(sendedotp) !== enteredotp) {
    return res.status(400).json({message: 'Invalid OTP', success: false});
  }
  try {
    const {username, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      isPremium: false,
      dateCreated: new Date(),
      deleteStatus: false,
      isBlocked: false,
    });
    await newUser.save();
    const token = jwt.sign(
        {
          userId: newUser._id,
          username: newUser.username,
          role: newUser.role,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: '1d',
        },
    );
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      role: newUser.role,
    });
  } catch (error) {
    return res.status(500).json({error: 'Internal Server error'});
  }
};

const login = async (req, res) => {
  try {
    const {usernameOrEmail, password} = req.body;

    if (!usernameOrEmail || !password) {
      return res.json({message: 'Enter the fields properly'});
    }

    const existingUser = await Users.findOne({
      $or: [{email: usernameOrEmail}, {username: usernameOrEmail}],
    });

    if (existingUser) {
      if (!existingUser.deleteStatus) {
        if (existingUser.isBlocked) {
          return res.json({
            message: 'This account has been blocked by the admin',
          });
        }
        const matchPassword = await bcrypt.compare(
            password,
            existingUser.password,
        );

        if (!matchPassword) {
          return res.json({message: 'Password did not match'});
        }
        const role = existingUser.role;
        const token = jwt.sign(
            {
              userId: existingUser._id,
              username: existingUser.username,
              role: existingUser.role,
            },
            process.env.SECRET_KEY,
            {expiresIn: '1d'},
        );
        if (existingUser.bandId && existingUser.bandId != '') {
          return res.json({
            success: true,
            message: 'Login successful',
            token,
            role: role,
            isInBand: 'true',
          });
        } else {
          return res.json({
            success: true,
            message: 'Login successful',
            token,
            role: role,
            isInBand: 'false',
          });
        }
      } else {
        return res.json({message: 'This account has been deleted'});
      }
    }
    return res.json({message: 'No user exists'});
  } catch (error) {
    return res.status(500).json({error: 'Internal Server Error'});
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const user = await Users.aggregate([
      {$match: {_id: userId}},
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
        },
      },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: 'userId',
          as: 'songs',
        },
      },
      {
        $lookup: {
          from: 'bands',
          localField: '_id',
          foreignField: 'bandAdmin',
          as: 'bandAdmin',
        },
      },
      {
        $lookup: {
          from: 'bands',
          localField: '_id',
          foreignField: 'bandMembers',
          as: 'bandMember',
        },
      },
    ]);
    if (!user || !user[0]) {
      return res.json({message: 'No User Found'});
    } else {
      res.json(user);
    }
  } catch (err) {
    res.json({message: err.message || 'Error Occured'});
  }
};

const getFollowingList = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const currentUser = await Users.findById(userId);
    const followingUsers = await Users.aggregate([
      {
        $match: {_id: {$in: currentUser.following}},
      },
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'userProfile',
        },
      },
    ]);
    return res.status(200).json(followingUsers);
  } catch (error) {
    return res.status(500).json({message: 'Internal server error'});
  }
};

const getFollowersList = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const currentUser = await Users.findById(userId);
    if (!currentUser) {
      return res.status(404).json({message: 'User not found'});
    }
    const followersList = await Users.aggregate([
      {
        $match: {_id: {$in: currentUser.followers}},
      },
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'userProfile',
        },
      },
    ]);
    return res.status(200).json(followersList);
  } catch (error) {
    return res.status(500).json({message: 'Internal server error'});
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const user = await Users.findOne({_id: userId});
    const {following} = user;
    // const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const bandInvitation = await Band.aggregate([
      {$match: {requestedMembers: userId}},
      {
        $lookup: {
          from: 'users',
          localField: 'bandAdmin',
          foreignField: '_id',
          as: 'bandAdminInfo',
        },
      },
    ]);
    const songs = await Songs.aggregate([
      {
        $match: {
          userId: {$in: following},
          // releaseDate: {$gte: {$toMillis: twentyFourHoursAgo}},
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
        $unwind: '$artist',
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
    if (bandInvitation.length > 0 && songs.length > 0) {
      return res.json({bandInvitation, songs});
    } else if (bandInvitation.length > 0) {
      return res.json({bandInvitation});
    } else if (songs.length > 0) {
      return res.json({songs});
    } else {
      return res.json({message: 'No new Notifications'});
    }
  } catch (err) {
    res.json({message: err.message || 'Server Error'});
  }
};

const getBandProfile = async (req, res) => {
  const bandId = new mongoose.Types.ObjectId(req.params.id);
  const band = await Band.aggregate([
    {
      $match: {_id: bandId},
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
    {
      $unwind: '$bandAdmin',
    },
  ]);
  res.json(band);
};

module.exports = {
  signup,
  otpVerify,
  login,
  getUserProfile,
  getFollowingList,
  getFollowersList,
  getNotifications,
  getBandProfile,
};
