const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const user = require('../controllers/userController/userController');
const getUserId = require('../middleware/getUserId');

router.get('/profile', getUserId, user.getProfile);

module.exports = router;
