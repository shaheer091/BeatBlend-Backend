const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  reciever: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  chatdata: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


const chating = mongoose.model('chat', chatSchema);

module.exports = chating;
