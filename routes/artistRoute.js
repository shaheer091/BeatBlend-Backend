const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const artist = require('../controllers/artistController/artistController');
const userID = require('../middleware/getUserId');

router.post('/addSong', userID, artist.addSong);
router.get('/songs', userID, artist.getSong);
router.get('/profile', userID, artist.getProfile);
router.delete('/deleteSong/:id', artist.deleteSong);


module.exports=router;
