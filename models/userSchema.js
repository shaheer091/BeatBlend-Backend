const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  isPremium: {
    type: Boolean,
    required: true,
  },
  dataCreated: {
    type: String,
    required: true,
  },
  deleteStatus: {
    type: Boolean,
    required: true,
  },
});

const user=mongoose.model('User', userSchema);

module.exports=user;
