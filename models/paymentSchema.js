const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  orderId: String,
  paymentId: String,
  signature: String,
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports=mongoose.model('Payment', paymentSchema);
