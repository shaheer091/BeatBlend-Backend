const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const band = require('../controllers/bandController');
const userId = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/home', userId, band.getBandHome);
router.get('/getBandMembers', userId, band.getBandMembers);
router.get('/search/:searchText', userId, band.searchArtist);
router.get('/songs', userId, band.getSongs);
router.get('/getSong/:id', userId, band.getSingleSong);
router.get('/getProfile', userId, band.getBandProfile);

router.post('/addSong', userId, upload.single('songFile'), band.addSong);
router.post('/addProfile', userId, upload.single('bandImage'), band.addProfile);

router.patch('/removeFromBand', userId, band.removeFromBand);
router.patch('/addToBand', userId, band.addToBand);
router.patch('/editSong/:id', userId, band.editSong);

module.exports=router;
