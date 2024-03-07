const mongoose = require('mongoose');

const bandSchema = new mongoose.Schema({
  bandName: {
    type: String,
    required: true,
  },
  bandImage: {
    type: String,
    required: true,
  },
  bandAdmin: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  bandMembers: {
    type: [mongoose.Types.ObjectId],
  },
  requestedMembers: {
    type: [mongoose.Types.ObjectId],
  },
});

module.exports = mongoose.model('band', bandSchema);
