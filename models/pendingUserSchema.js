const mongoose=require('mongoose');

const pendingUser=new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  socialMediaLink: {
    type: String,
  },
  role: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },
  deleteStatus: {
    type: Boolean,
  },
});

const pendingUsers=mongoose.model('pendingUsers', pendingUser);
module.exports=pendingUsers;
