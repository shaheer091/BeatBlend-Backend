const Users = require('../../models/userSchema');
// const PendingUser = require('../../models/pendingUserSchema');
const emailService = require('./emailController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const {username, email, password, confirmPassword} = req.body;
  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({message: 'Enter your details'});
  }
  const existingUser = await Users.findOne({
    $or: [{email}, {username}],
  });
  if (existingUser) {
    if (existingUser.email === email) {
      return res
          .status(200)
          .json({message: 'User with this email already exists'});
    } else if (existingUser.username === username) {
      return res
          .status(200)
          .json({message: 'User with this username already exists'});
    }
  } else {
    try {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await emailService.sendOtp(email, otp);
      res.status(200).json({message: 'OTP is successfully sent', otp});
    } catch (error) {
      console.log(`error sending otp to email ${error}`);
      res.status(500).json({error: 'Internal Server error'});
    }
  }
};

const otpVerify = async (req, res) => {
  const {sendedotp, enteredotp} = req.body;

  if (String(sendedotp) !== enteredotp) {
    return res.status(400).json({message: 'Invalid OTP', success: false});
  }
  try {
    const {
      username,
      email,
      password,
      role,
      isVerified,
      isPremium,
      dateCreated,
      deleteStatus,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified,
      isPremium,
      dateCreated,
      deleteStatus,
    });
    await newUser.save();
    const token = jwt.sign({userId: newUser._id}, process.env.SECRET_KEY, {
      expiresIn: '1d',
    });
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      role: newUser.role,
    });
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({error: 'Internal Server error'});
  }
};
const login = async (req, res) => {
  try {
    const {usernameOrEmail, password} = req.body;

    if (!usernameOrEmail || !password) {
      return res.json({message: 'Enter the fields properly'});
    }

    const existingUser = await Users.findOne({
      $or: [{email: usernameOrEmail}, {username: usernameOrEmail}],
    });

    if (existingUser) {
      if (!existingUser.deleteStatus) {
        const matchPassword = await bcrypt.compare(
            password,
            existingUser.password,
        );

        if (!matchPassword) {
          return res.json({message: 'Password did not match'});
        }
        const role = existingUser.role;

        const token = jwt.sign(
            {userId: existingUser._id},
            process.env.SECRET_KEY,
            {expiresIn: '1d'},
        );
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          role: role,
        });
      } else {
        return res.json({message: 'This account has been deleted'});
      }
    }
    return res.json({message: 'No user exists'});
  } catch (error) {
    return res.status(500).json({error: 'Internal Server Error'});
  }
};

module.exports = {
  signup,
  otpVerify,
  login,
};
