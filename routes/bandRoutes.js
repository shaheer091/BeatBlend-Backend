const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const band = require('../controllers/bandController');
const userId = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/home', userId, band.getBandHome);
router.get('/getBandMembers', userId, band.getBandMembers);
router.get('/search/:searchText', userId, band.searchArtist);

router.post('/addSong', userId, upload.single('songFile'), band.addSong);

router.patch('/removeFromBand', userId, band.removeFromBand);
router.patch('/addToBand', userId, band.addToBand);

module.exports=router;