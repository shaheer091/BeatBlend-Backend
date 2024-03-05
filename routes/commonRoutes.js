const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const common = require('../controllers/commonController/commonController');
const getUserId = require('../middleware/getUserId');

router.post('/signup', common.signup);
router.post('/otp-verify', common.otpVerify);
router.post('/login', common.login);

router.get('/user-profile/:id', common.getUserProfile);
router.get('/following-list', getUserId, common.getFollowingList);
router.get('/followers-list', getUserId, common.getFollowersList);
module.exports = router;
