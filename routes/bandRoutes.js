const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const band = require('../controllers/bandController');
const userId = require('../middleware/getUserId');

router.get('/home', userId, band.getBandHome);

module.exports=router;
