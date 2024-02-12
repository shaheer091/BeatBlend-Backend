const Users = require('../../models/userSchema');
const Profile = require('../../models/profileSchema');

const getProfile = async (req, res) => {
  try {
    console.log('------------------------------');
    console.log(req.tockens);
    console.log('------------------------------');
    const user = await Users.findOne({_id: req.tockens.userId});
    res.json({user});
    console.log(user);
  } catch (error) {
    console.log(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log(req.body);
    console.log( req.tockens);
    const {file, bio, phoneNumber, date, gender} = req.body;
    const newProfile = new Profile({
      userId: req.tockens.userId,
      imageUrl: file,
      bio,
      phoneNumber,
      dateOfBirth: date,
      gender,
    });
    console.log(newProfile);
    await newProfile.save();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
