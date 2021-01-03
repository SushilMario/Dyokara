const mongoose = require("mongoose");

let Line_upSchema = new mongoose.Schema
(
    {
        productNumber: Number,
        sizeList: [String],
        variations: 
        [
            {
                size: String,
                colours: [String]
            }
        ]
    }
);

module.exports = mongoose.model("Line_up", Line_upSchema);