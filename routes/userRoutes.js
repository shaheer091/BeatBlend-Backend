const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController/userController');
const getUserId = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/profile', getUserId, user.getProfile);
router.get('/getSong', getUserId, user.getSong);
router.get('/settings', getUserId, user.getSettings);
router.get('/favorite', getUserId, user.getFavSongs);
router.get('/search/:text', getUserId, user.search);
router.get('/searchSong/:searchText', getUserId, user.searchSong);
router.get('/getPlaylist', getUserId, user.getPlaylist);

router.put('/profile', getUserId, upload.single('file'), user.updateProfile);

router.post('/verifyPhone', getUserId, user.verifyPhone);
router.post('/verifyOtp', getUserId, user.verifyOtp);
router.post('/artistVerify', getUserId, user.verifyUser);
router.post('/follow', getUserId, user.followAndUnfollowUser);
router.post('/favUnfav', getUserId, user.favAndUnfavSong);
// router.post('/addToPlayList', getUserId, user.addToPlaylist);
router.post(
    '/createPlaylist',
    getUserId,
    upload.single('playlistImage'),
    user.createPlaylist,
);

module.exports = router;
