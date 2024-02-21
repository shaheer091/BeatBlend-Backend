const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController/userController');
const getUserId = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/profile', getUserId, user.getProfile);

router.put('/profile', upload.single('file'));

router.post('/verifyPhone', getUserId, user.verifyPhone);
router.post('/verifyOtp', getUserId, user.verifyOtp);
router.post('/artistVerify', getUserId, user.verifyUser);
router.post('/search', user.search);

module.exports = router;

// , getUserId, user.updateProfile
