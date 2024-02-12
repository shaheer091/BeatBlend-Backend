const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const common = require('../controllers/userController/commonController');
const getUserId = require('../middleware/getUserId');

router.post('/signup', common.signup);
router.post('/otp-verify', common.otpVerify);
router.post('/login', getUserId, common.login);

module.exports = router;
