const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  Name: { type: String, required: true },

  Mobile: { type: String, required: true },

  Address: { type: String, required: true },

  Pincode:{type:String,required:true},
  
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },



  
});

module.exports = mongoose.model("Address", addressSchema);