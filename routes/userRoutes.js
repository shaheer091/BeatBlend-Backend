const express=require('express');
// eslint-disable-next-line new-cap
const router=express.Router();
const user=require('../controllers/userController/signupController');

router.post('/signup', user.signup);
// router.post('/otp-verify', user.otpVerify);

module.exports=router;
