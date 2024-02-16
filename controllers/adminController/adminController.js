const Users = require('../../models/userSchema');
// const Profile = require('../../models/profileSchema');
const PendingUser = require('../../models/pendingUserSchema');
// const mongoose = require('mongoose');
const emailController = require('../commonController/emailController');

const getAllUsers = async (req, res) => {
  const user = await Users.find({role: 'user'});
  if (user) {
    res.json({user});
  } else {
    res.json({message: 'No user found'});
  }
};

const getAllArtist = async (req, res) => {
  const artist = await Users.find({role: 'artist'});
  if (artist) {
    res.json({artist});
  } else {
    res.json({message: 'No artist Found'});
  }
};

const getAllPending = async (req, res) => {
  const pending = await PendingUser.find();
  if (pending) {
    res.json({pending});
  } else {
    res.json({message: 'No pending User Found'});
  }
};

const getAllAdmin = async (req, res) => {
  const admin = await Users.find({role: 'admin'});
  if (admin) {
    res.json({admin});
  } else {
    res.json({message: 'No Admin Found'});
  }
};

const changeDeleteStatus = async (req, res) => {
  try {
    const userID = req.body.userId;
    const user = await Users.findOne({_id: userID});
    const newDeleteStatus = !user.deleteStatus;
    await Users.updateOne(
        {_id: userID},
        {$set: {deleteStatus: newDeleteStatus}},
    );
    if (newDeleteStatus) {
      console.log('user deleted');
      res.json({message: 'user deleted successfully'});
    } else {
      console.log('user undeleted');
      res.json({message: 'user undeleted successfully'});
    }
  } catch (err) {
    console.log(err);
    res.json({message: 'error deleting user'});
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await Users.findOne({_id: userId});
    await Users.updateOne(
        {_id: userId},
        {$set: {role: 'artist', isVerified: true}},
    );
    await PendingUser.deleteOne({userId});
    console.log('User approved successfully');
    await emailController.approveUser(user.email);
    res.status(200).json({message: 'User approved successfully'});
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  getAllUsers,
  getAllArtist,
  getAllPending,
  getAllAdmin,
  changeDeleteStatus,
  approveUser,
};
