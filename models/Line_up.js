const mongoose = require("mongoose");

let Line_upSchema = new mongoose.Schema
(
    {
        name: String,
        lineupNumber: Number,
        category: String,
        categoryID: mongoose.Schema.Types.ObjectId,

        sizeList: [String],
        variations: 
        [
            {
                size: String,
                colours: [String]
            }
        ],

        products:
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ]
    }
);

module.exports = mongoose.model("Line_up", Line_upSchema);