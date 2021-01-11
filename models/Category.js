const mongoose = require("mongoose");

let CategorySchema = new mongoose.Schema
(
    {
        name: String,
        byline: String,

        lineups:
        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Line_up"
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

module.exports = mongoose.model("Category", CategorySchema);