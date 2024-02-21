const Users = require('../../models/userSchema');
const Profile = require('../../models/profileSchema');
const PendingUser = require('../../models/pendingUserSchema');
const mongoose = require('mongoose');
const sendOtp = require('../../utility/sendOtp');
const verifyOtpFn = require('../../utility/verifyOtp');
const emailController = require('../commonController/emailController');

const getProfile = async (req, res) => {
  // console.log('inside getProfile function');
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
    console.log(userProfile[0]);
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

const verifyUser = async (req, res) => {
  try {
    const socialMediaLink = req.body.socialMediaLink;

    // Make sure user provided socsial links
    if (!socialMediaLink) {
      throw Object.assign(new Error('Please enter social media link!'), {
        statusCode: 202,
      });
    }

    const userId = req.tockens.userId;

    // Get user details from db
    const user = await Users.findOne({_id: userId});

    if (!user) {
      throw new Error('Failed to get user details with provided id!');
    }

    // Create new user object
    const pendingUser = new PendingUser({
      userId: user._id,
      username: user.username,
      email: user.email,
      socialMediaLink: socialMediaLink,
      role: user.role,
      isVerified: false,
      deleteStatus: false,
    });

    // Save user
    await pendingUser.save();

    // Send an email to admin to get approuval
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
    console.log(req.body.text);
    const searchText = req.body.text;
    const users = await Users.find({
      username: {$regex: searchText, $options: 'i'},
    });
    console.log(users);
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  verifyPhone,
  verifyOtp,
  verifyUser,
  search,
};
