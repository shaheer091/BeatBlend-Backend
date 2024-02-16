const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const admin = require('../controllers/adminController/adminController');

router.get('/seeAllUsers', admin.getAllUsers);
router.get('/seeAllArtist', admin.getAllArtist);
router.get('/seeAllPending', admin.getAllPending);
router.get('/seeAllAdmin', admin.getAllAdmin);


module.exports=router;
