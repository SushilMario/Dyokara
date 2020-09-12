const mongoose = require("mongoose");

let reviewSchema = mongoose.Schema(
{
   text: String,
   author: String
});

module.exports = mongoose.model("Review", reviewSchema);