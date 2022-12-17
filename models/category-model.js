const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    Category: { type: String, required: true }
 
});

module.exports = mongoose.model("Category", categorySchema);