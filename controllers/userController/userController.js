const Users = require('../../models/userSchema');
const Profile = require('../../models/profileSchema');
const PendingUser = require('../../models/pendingUserSchema');
const mongoose = require('mongoose');
const sendOtp = require('../../utility/sendOtp');
const verifyOtpFn = require('../../utility/verifyOtp');
const emailController = require('../commonController/emailController');

const getProfile = async (req, res) => {
  try {
    // console.log('------------------------------');
    // console.log(req.tockens.userId);
    // console.log('------------------------------');
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
    // console.log(userProfile[0]);
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.tockens);
    const {file, bio, phoneNumber, date, gender, username, email} = req.body;
    await Profile.updateOne(
        {userId: req.tockens.userId},
        {
          $set: {
            imageUrl: file,
            bio,
            phoneNumber,
            dateOfBirth: date,
            gender,
          },
        },
        {
          upsert: true,
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
        {
          upsert: true,
        },
    );
    res.json({message: 'Profile updated successfully'});
  } catch (error) {
    console.log(error);
    res.json({message: 'Profile updation failed'});
  }
};

const verifyPhone = async (req, res) => {
  console.log('iside cerifyphone');
  console.log(req.body);
  try {
    const phoneNumber = req.body.phone;
    // console.log(req.body);
    console.log(phoneNumber);
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
  console.log(req.body);
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

const verifyUser =async (req, res) => {
  console.log('inside verifyUser function');
  try {
    console.log(req.body);
    const socialMediaLink = req.body.socialMediaLink;
    if (!socialMediaLInk) {
      res.json({message: 'enter social media link'});
    }
    const userId=req.tockens.userId;
    console.log(userId);
    const user = await Users.findOne({_id: userId});
    if (user) {
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
    } else {
      console.log('no user found');
    }
  } catch (err) {
    console.log('ending error', err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  verifyPhone,
  verifyOtp,
  verifyUser,
};
