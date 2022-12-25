const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Serial: { type: String, required: true },

  Name: { type: String, required: true },

  Description: { type: String, required: true },

  Price: { type: Number, required: true },

  Category: { type: String, required: true },

  image: { type: String },

  image2: { type: String},


  isAvailable:{type:Number ,default:1},

  quantity :{type:Number},

  Sales:{type:Number,default:0}

  
});

module.exports = mongoose.model("Product", productSchema);
