const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const admin = require('../controllers/adminController');
const userId = require('../middleware/getUserId');

router.get('/seeAllUsers', userId, admin.getAllUsers);
router.get('/seeAllArtist', userId, admin.getAllArtist);
router.get('/seeAllPending', userId, admin.getAllPending);
router.get('/seeAllAdmin', userId, admin.getAllAdmin);
router.get('/getHome', userId, admin.getHome);

router.patch('/changeDeleteStatus', userId, admin.changeDeleteStatus);
router.patch('/changeBlockStatus', userId, admin.changeBlockStatus);
router.patch('/approveUser', userId, admin.approveUser);
router.patch('/changeSongBlockStatus', userId, admin.changeSongBlockStatus);

router.delete('/declineUser/:id', userId, admin.declineUser);


module.exports=router;
