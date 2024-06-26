const Users = require('../models/userSchema');
// const Profile = require('../models/profileSchema');
const PendingUser = require('../models/pendingUserSchema');
// const mongoose = require('mongoose');
const emailController = require('../utility/emailController');
const Songs = require('../models/songSchema');

const getAllUsers = async (req, res) => {
  const user = await Users.find({role: 'user'});
  if (user.length > 0) {
    res.json({user, success: true});
  } else {
    res.json({message: 'No user found', success: false});
  }
};

const getAllArtist = async (req, res) => {
  const artist = await Users.find({role: 'artist'});
  if (artist.length > 0) {
    res.json({artist, success: true});
  } else {
    res.json({message: 'No artist Found', success: false});
  }
};

const getAllPending = async (req, res) => {
  const pending = await PendingUser.find();
  if (pending.length > 0) {
    res.json({pending, success: true});
  } else {
    res.json({message: 'No pending User Found', success: false});
  }
};

const getAllAdmin = async (req, res) => {
  const admin = await Users.find({role: 'admin'});
  if (admin.length > 0) {
    res.json({admin, success: true});
  } else {
    res.json({message: 'No Admin Found', success: false});
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
      res.json({message: 'user deleted successfully'});
    } else {
      res.json({message: 'user undeleted successfully'});
    }
  } catch (err) {
    res.json({message: err.message || 'Error in deleting the user.'});
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
    await emailController.approveUser(user.email);
    res.status(200).json({message: 'User approved successfully'});
    await PendingUser.deleteOne({userId});
  } catch (err) {
    res.json({message: err.message || 'Error while approving the User'});
  }
};

const declineUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await PendingUser.find({userId: userId});
    const userEmail = user[0].email;
    await emailController.declineUser(userEmail);
    await PendingUser.deleteOne({userId});
    res.json({message: 'User Decline and mail send successfully'});
  } catch (err) {
    res.json({message: err.message || 'Error while declining User'});
  }
};

const changeBlockStatus = async (req, res) => {
  try {
    const userID = req.body.userId;
    const user = await Users.findOne({_id: userID});
    const newBlockStatus = !user.isBlocked;
    await Users.updateOne(
        {_id: userID},
        {$set: {isBlocked: newBlockStatus}},
    );
    if (newBlockStatus) {
      res.json({message: 'user blocked successfully'});
    } else {
      res.json({message: 'user unblocked successfully'});
    }
  } catch (err) {
    res.json({message: err.message || 'error blocking user'});
  }
};

const getHome = async (req, res) => {
  try {
    const users = await Users.find();
    const pendingUsers = await PendingUser.find();
    if (users) {
      res.json({users, pendingUsers});
    }
  } catch (err) {
    res.json({message: err.message || 'Error while fatching Home page'});
  }
};

const changeSongBlockStatus = async (req, res) => {
  try {
    const songId = req.body.songId;
    const song = await Songs.findById(songId);
    if (song) {
      const newStatus = !song.isBlocked;

      await Songs.updateOne(
          {_id: songId},
          {$set: {isBlocked: newStatus}},
      );
      if (newStatus == true) {
        return res
            .status(200)
            .json({message: 'Song blocked successfully.'});
      } else {
        return res.json({message: 'Song unblockeed'});
      }
    } else {
      return res.status(404).json({message: 'Song not found.'});
    }
  } catch (error) {
    console.error('Error changing song block status:', error);
    return res.status(500).json({message: 'Internal server error.'});
  }
};

module.exports = {
  getAllUsers,
  getAllArtist,
  getAllPending,
  getAllAdmin,
  changeDeleteStatus,
  approveUser,
  declineUser,
  changeBlockStatus,
  getHome,
  changeSongBlockStatus,
};
