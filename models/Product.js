const mongoose = require("mongoose");

let ProductSchema = new mongoose.Schema
    (
        {
            name: String,
			image: String,
            shortDesc: String,
            longDesc: String,
            price: Number,
            specifications: {},
            reviews:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Review"
                }
            ]
        }
    );

module.exports = mongoose.model("Product", ProductSchema);