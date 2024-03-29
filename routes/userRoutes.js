const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController');
const getUserId = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/profile', getUserId, user.getProfile);
router.get('/getSong', getUserId, user.getSong);
router.get('/settings', getUserId, user.getSettings);
router.get('/favorite', getUserId, user.getFavSongs);
router.get('/search/:text', getUserId, user.search);
router.get('/searchSong/:searchText', getUserId, user.searchSong);
router.get('/getPlaylist', getUserId, user.getPlaylist);
router.get('/singlePlaylist/:id', getUserId, user.getSinglePlaylist);
router.get('/comments/:songId', getUserId, user.getComment);

router.put('/profile', getUserId, upload.single('file'), user.updateProfile);

router.post('/verifyPhone', getUserId, user.verifyPhone);
router.post('/verifyOtp', getUserId, user.verifyOtp);
router.post('/artistVerify', getUserId, user.verifyUser);
router.post('/follow', getUserId, user.followAndUnfollowUser);
router.post('/favUnfav', getUserId, user.favAndUnfavSong);
router.post(
    '/createPlaylist',
    getUserId,
    upload.single('playlistImage'),
    user.createPlaylist,
);
router.post('/likeUnlikeSong', getUserId, user.likeUnlikeSong);
router.post('/addComment', getUserId, user.addComment);

router.delete('/removeFromPlaylist/:id', getUserId, user.removeFromPlaylist);
router.delete('/deletePlaylist/:id', getUserId, user.deletePlaylist);

module.exports = router;
