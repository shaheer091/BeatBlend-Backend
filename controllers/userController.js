const Users = require('../models/userSchema');
const Profile = require('../models/profileSchema');
const PendingUser = require('../models/pendingUserSchema');
const Songs = require('../models/songSchema');
const Playlist = require('../models/playlistSchema');
const Chats = require('../models/chatSchema');
const mongoose = require('mongoose');
const sendOtp = require('../utility/sendOtp');
const verifyOtpFn = require('../utility/verifyOtp');
const emailController = require('../utility/emailController');
const Comments = require('../models/commentSchema');
const razorpay = require('../utility/razorPay');
const Payment = require('../models/paymentSchema');

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
    res.json({message: error.message || 'Server Error'});
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
    res.json({message: error.message || 'Profile updation failed'});
  }
};

const verifyPhone = async (req, res) => {
  try {
    const phoneNumber = req.body.phone;
    await sendOtp(phoneNumber);
    res.status(200).json({message: 'OTP sent successfully'});
  } catch (error) {
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
    res.json({message: err.message || 'Server Error'});
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
    res.json({message: err.message || 'Server Error'});
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
    res.json({message: err.message || 'Server Error'});
  }
};

const getSong = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
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
      return res.json({songs: aggregatedSongs, username, userId});
    }
  } catch (err) {
    return res.status(500).json({error: 'Internal server error'});
  }
};

const getSettings = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const user = await Users.findOne({_id: userId});
    const profile = await Profile.findOne({userId: userId});
    if (profile && user) {
      res.json({user, profile});
    }
  } catch (err) {
    res.status(500).json({error: err.message || 'Internal server error'});
  }
};

const favAndUnfavSong = async (req, res) => {
  const {songId} = req.body;
  const userId = new mongoose.Types.ObjectId(req.tockens.userId);

  try {
    const songExistenceChecker = await Songs.exists({_id: songId});
    if (!songExistenceChecker) {
      return res.status(400).json({error: 'This song doesn\'t exist'});
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }
    const alreadyFav = user.favorite.includes(songId);
    if (alreadyFav) {
      await Users.findByIdAndUpdate(userId, {$pull: {favorite: songId}});
      await Songs.findByIdAndUpdate(songId, {
        $pull: {favouritedBy: userId},
      });
      return res.status(200).json({message: 'Disliked the song'});
    } else {
      await Users.findByIdAndUpdate(userId, {
        $addToSet: {favorite: songId},
      });
      await Songs.findByIdAndUpdate(songId, {
        $addToSet: {favouritedBy: userId},
      });
      return res.status(200).json({message: 'Liked the song', userId});
    }
  } catch (error) {
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
    return res
        .status(500)
        .json({error: err.message || 'Internal server error'});
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
      res.status(500).json({error: 'Internal server error'});
    }
  } catch (err) {
    res.json({message: err.message || 'Server Error!'});
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
    res.json({message: err.message || 'Server Error!'});
  }
};

const getSinglePlaylist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
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
          playlistName: {$first: '$playlistName'},
          songs: {$push: '$songs'},
          imageUrl: {$first: '$imageUrl'},
        },
      },
    ]);

    if (playlist) {
      res.json({playlist, userId});
    }
  } catch (err) {
    res.json({message: err.message || 'Server error'});
  }
};

const removeFromPlaylist = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const songId = new mongoose.Types.ObjectId(req.body.songId);
    const playlistId = new mongoose.Types.ObjectId(req.body.playlistId);
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({error: 'Playlist not found'});
    }
    if (userId != playlist.userId) {
      return res.json({error: 'Unauthorized Access!'});
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$pull: {songId: songId}},
        {new: true},
    );
    if (updatedPlaylist) {
      res.json({message: 'Song removed from playlist'});
    } else {
      console.warn(
          `Song with ID ${songId} not found in playlist ${playlistId}`,
      );
      res.status(400).json({error: 'Song not found in playlist'});
    }
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlistId = new mongoose.Types.ObjectId(req.params.id);

    const result = await Playlist.deleteOne({_id: playlistId});
    if (result.deletedCount === 1) {
      res.status(200).json({message: 'Playlist deleted successfully'});
    } else {
      res.status(404).json({error: 'Playlist not found'});
    }
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
};

const likeUnlikeSong = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const songId = new mongoose.Types.ObjectId(req.body.songId);
    const user = await Users.findById(userId);
    const alreadyLiked = user.likedSongs.includes(songId);
    if (alreadyLiked) {
      await Users.findByIdAndUpdate(userId, {$pull: {likedSongs: songId}});
      await Songs.findByIdAndUpdate(songId, {$pull: {likedBy: userId}});
      return res.status(200).json({message: 'Disliked the song'});
    } else {
      await Users.findByIdAndUpdate(userId, {
        $addToSet: {likedSongs: songId},
      });
      await Songs.findByIdAndUpdate(songId, {$addToSet: {likedBy: userId}});
      return res.status(200).json({message: 'Liked the song'});
    }

    res
        .status(200)
        .json({success: true, message: 'Toggle like status successfully.'});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while toggling like status.',
    });
  }
};

const addComment = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.tockens.userId);
    const {comment, songId} = req.body;
    if (!userId || !songId || !comment) {
      return res.json({message: 'Required fields are missing'});
    }
    const newComment = new Comments({
      userId,
      songId,
      comment,
    });
    await newComment.save();
    if (newComment) {
      res.json({message: 'Comment added successfully'});
    } else {
      res.json({message: 'Error addning Comment'});
    }
  } catch (err) {
    res.json({message: err.message || 'Server Error'});
  }
};

const getComment = async (req, res) => {
  try {
    const songId = new mongoose.Types.ObjectId(req.params.songId);
    const comments = await Comments.aggregate([
      {
        $match: {songId},
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'users',
          pipeline: [
            {
              $project: {_id: 1, username: 1},
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'users._id',
          foreignField: 'userId',
          as: 'userProfile',
          pipeline: [
            {
              $project: {_id: 1, imageUrl: 1},
            },
          ],
        },
      },
    ]);
    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.json({message: 'No comments yet'});
    }
  } catch (err) {
    res.json({
      message: err.message || 'Error occurred while fetching comments.',
    });
  }
};

const getPremium = async (req, res) => {
  try {
    const amount = req.body.price;
    razorpay.orders
        .create({
          amount: amount * 100,
          currency: 'INR',
          receipt: 'receipt_' + Math.random().toString(36).substring(2, 15),
        })
        .then((order) => {
          res.json(order);
        })
        .catch((error) => {
          res.status(500).json({error: 'Failed to create order'});
        });
  } catch (err) {
    res.json({message: err.message || 'Internal server error'});
  }
};

const successPayment = async (req, res) => {
  const userId = req.tockens.userId;
  try {
    const orderId = req.body.data.razorpay_order_id;
    const paymentId = req.body.data.razorpay_payment_id;
    const signature = req.body.data.razorpay_signature;
    await Users.findOneAndUpdate(
        {_id: userId},
        {$set: {isPremium: true}},
        {new: true},
    );
    const newPayment = new Payment({
      userId,
      orderId,
      paymentId,
      signature,
    });
    newPayment.save();
  } catch (err) {
    res.json({message: err.message || 'Server Error'});
  }
};

const getPlaylistData = async (req, res) => {
  try {
    // const userId = req.tockens.userId;
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
    ]);
    if (playlist) {
      res.json(playlist);
    }
  } catch (err) {
    res.json({message: err.message || 'Error in getting data.'});
  }
};

const editPlaylist = async (req, res) => {
  try {
    // const userId = req.tockens.userId;
    const playlistId = req.params.id;
    const {playlistName, songIds} = req.body;
    const file = req?.file?.location;
    await Playlist.updateOne(
        {_id: playlistId},
        {$set: {playlistName, songId: songIds, imageUrl: file}},
    );
    res.json({message: 'Playlist updated successfully'});
  } catch (error) {
    res.status(500).json({error: 'Internal server error'});
  }
};

const getPreviousMsg = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.tockens.userId);
  // const receiverId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const chats = await Chats.aggregate([
      {
        $match: {
          $or: [{sender: userId}, {receiver: userId}],
        },
      },
    ]);
    res.json(chats);
  } catch (error) {
    res.status(500).json({error: 'Internal Server Error'});
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
  likeUnlikeSong,
  addComment,
  getComment,
  getPremium,
  successPayment,
  getPlaylistData,
  editPlaylist,
  getPreviousMsg,
};
