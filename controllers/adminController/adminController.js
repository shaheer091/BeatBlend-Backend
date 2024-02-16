const Users = require('../../models/userSchema');
// const Profile = require('../../models/profileSchema');
const PendingUser = require('../../models/pendingUserSchema');
// const mongoose = require('mongoose');

const getAllUsers = async (req, res)=>{
  const user = await Users.find({role: 'user'});
  if (user) {
    res.json({user});
  } else {
    res.json({message: 'No user found'});
  }
};

const getAllArtist = async (req, res)=>{
  const artist = await Users.find({role: 'artist'});
  if (artist) {
    res.json({artist});
  } else {
    res.json({message: 'No artist Found'});
  }
};

const getAllPending = async (req, res)=>{
  const pending = await PendingUser.find();
  if (pending) {
    res.json({pending});
  } else {
    res.json({message: 'No pending User Found'});
  }
};

const getAllAdmin = async (req, res)=>{
  const admin = await Users.find({role: 'admin'});
  if (admin) {
    res.json({admin});
  } else {
    res.json({message: 'No Admin Found'});
  }
};

module.exports={
  getAllUsers,
  getAllArtist,
  getAllPending,
  getAllAdmin,
};
