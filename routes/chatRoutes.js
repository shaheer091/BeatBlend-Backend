const express = require('express');
// eslint-disable-next-line new-cap
const router=express.Router();
const userId = require('../middleware/getUserId');
const chat = require('../controllers/chatController');

// router.get('/userMessages', userId, chat.userMessages);
// router.get('/allMessages', userId, chat.allUserMessages);
// router.get('/getSingleUserChat/:name', userId, chat.getSingleUserChat);
router.post('/postingChat', userId, chat.postingChat);

module.exports=router;
