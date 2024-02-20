const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController/userController');
const getUserId = require('../middleware/getUserId');
// const multer = require('../middleware/multer');

router.get('/profile', getUserId, user.getProfile);

router.patch('/profile', getUserId, user.updateProfile);

router.post('/verifyPhone', getUserId, user.verifyPhone);
router.post('/verifyOtp', getUserId, user.verifyOtp);
router.post('/artistVerify', getUserId, user.verifyUser);

module.exports = router;
