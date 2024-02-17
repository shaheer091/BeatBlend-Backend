const Users = require('../../models/userSchema');
// const PendingUser = require('../../models/pendingUserSchema');
const emailService = require('./emailController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  // console.log('sudais');
  // console.log(req.body);
  const {username, email, password, confirmPassword} = req.body;
  // console.log(username, email, password, confirmPassword);
  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({message: 'Enter your details'});
  }
  const existingUser = await Users.findOne({
    $or: [{email}, {username}],
  });
  // console.log(existingUser);
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
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    try {
      // console.log('annachiee');
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
  // console.log(`serverotp ${sendedotp}  enteredotp ${enteredotp}`);

  // Check if entered OTP matches the generated OTP
  if (String(sendedotp) !== enteredotp) {
    // console.log('otp verification failed');
    return res.status(400).json({message: 'Invalid OTP'});
  }
  try {
    // Extract user data from the request body or any other source
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
    // console.log('-------------------------------');
    // console.log(req.body);
    // console.log('-------------------------------');

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
    // console.log('-------------------------------');
    // console.log(newUser);
    // console.log('-------------------------------');
    // Save the new user to the database
    await newUser.save();
    const token = jwt.sign({userId: newUser._id}, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    // console.log('***********************');
    // console.log('TOKEN', token);
    // console.log('***********************');

    // console.log('otp verified successfully');
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
  console.log('login button clicked');
  try {
    const {usernameOrEmail, password} = req.body;

    console.log('-----------------------------------');
    console.log(req.body);
    console.log('-----------------------------------');

    if (!usernameOrEmail || !password) {
      console.log('Enter the fields properly');
      return res.json({message: 'Enter the fields properly'});
    }

    const existingUser = await Users.findOne({
      $or: [{email: usernameOrEmail}, {username: usernameOrEmail}],
    });

    console.log(existingUser);
    console.log('======================');
    if (existingUser) {
      if (!existingUser.deleteStatus) {
        const matchPassword = await bcrypt.compare(
            password,
            existingUser.password,
        );

        if (!matchPassword) {
          console.log('Password did not match');
          return res.json({message: 'Password did not match'});
        }
        let role;
        if (existingUser.role == 'user') {
          role = existingUser.role;
        } else if (existingUser.role == 'admin') {
          role = existingUser.role;
        } else if (existingUser.role == 'artist') {
          role = existingUser.role;
        }

        const token = jwt.sign(
            {userId: existingUser._id},
            process.env.SECRET_KEY,
            {expiresIn: '1h'},
        );

        console.log('Login successful');
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          role: role,
        });
      } else {
        console.log('This account has been deleted');
        return res.json({message: 'This account has been deleted'});
      }
    }
    console.log('No user exists');
    return res.json({message: 'No user exists'});
  } catch (error) {
    console.error('Error executing findOne:', error);
    return res.status(500).json({error: 'Internal Server Error'});
  }
};

module.exports = {
  signup,
  otpVerify,
  login,
};