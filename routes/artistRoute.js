const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const artist = require('../controllers/artistController/artistController');
const userID = require('../middleware/getUserId');
const upload = require('../middleware/multer');

router.get('/songs', userID, artist.getSong);
router.get('/profile', userID, artist.getProfile);

router.post('/addSong', userID, upload.single('songFile'), artist.addSong);
router.patch('/profile', userID, artist.updateProfile);

router.delete('/deleteSong/:id', userID, artist.deleteSong);


module.exports=router;


