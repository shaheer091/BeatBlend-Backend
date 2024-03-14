const mongoose = require('mongoose');
const Users = require('../models/userSchema');
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

module.exports = {
  getBandHome,
};
