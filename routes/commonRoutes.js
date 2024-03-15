const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const common = require('../controllers/commonController');
const getUserId = require('../middleware/getUserId');

router.post('/signup', common.signup);
router.post('/otp-verify', common.otpVerify);
router.post('/login', common.login);

router.get('/user-profile/:id', getUserId, common.getUserProfile);
router.get('/band-profile/:id', getUserId, common.getBandProfile);
router.get('/following-list', getUserId, common.getFollowingList);
router.get('/followers-list', getUserId, common.getFollowersList);
router.get('/notifications', getUserId, common.getNotifications);
module.exports = router;
