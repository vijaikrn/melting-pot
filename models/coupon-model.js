const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  name: { type: String, required: true },
  discount: { type: Number, required: true },
  usedby: [{ userID: { type: mongoose.Types.ObjectId, ref: 'User' } }],
  
});

module.exports = mongoose.model("Coupon", couponSchema);
