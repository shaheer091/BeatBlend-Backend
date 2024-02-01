// const users=require('../../models/userSchema');
const emailService=require('./emailController');

const signup= async (req, res) => {
  console.log('sudais');
  console.log(req.body);
  const {username, email}=req.body;
  console.log(username, email, password, confirmPassword);
  if (!username||!email||!password||confirmPassword) {
    res.status(400).json({message: 'Enter your details'});
  } else {
    const otp=Math.floor(1000+Math.random()*9000).toString();
    try {
      await emailService(email, otp);
      res.status(200).json({message: 'OTP is successfully', otp});
    } catch (error) {
      console.log(`error sending otp to email ${error}`);
      res.status(500).json({error: 'Internal Server error'});
    }
  }
};

module.exports={
  signup,
};
