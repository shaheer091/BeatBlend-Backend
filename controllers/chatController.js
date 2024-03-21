const Chats = require('../models/chatSchema');
const postingChat = async (data, sender, reviver) => {
  const save = new Chats({
    reciever: reviver,
    sender: sender,
    chatdata: data,
  });

  await save.save();
};

const userMessages = async (req, res) => {
  try {
    const userId = req.tockens.userId;
    const messages = await Chats.find({
      $or: [{sender: userId}, {reciever: userId}],
    });
    console.log(messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const allUserMessages = async (req, res) => {
  try {
    const messages = await Chats.find({});
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const getSingleUserChat = async (req, res) => {
  try {
    const username = req.params.name;
    const messages = await Chats.find({
      $or: [{sender: username}, {reciever: username}],
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

module.exports = {
  postingChat,
  userMessages,
  allUserMessages,
  getSingleUserChat,
};
