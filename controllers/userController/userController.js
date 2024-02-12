const Users = require('../../models/userSchema');
// const jwt=require('jsonwebtoken');

const getProfile = async (req, res) => {
  try {
    console.log('------------------------------');
    console.log(req.tockens);
    console.log('------------------------------');
    const user=await Users.findOne({_id: req.tockens.userId});
    res.json({user});
    console.log(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProfile,
};
