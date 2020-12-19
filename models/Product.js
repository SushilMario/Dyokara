const mongoose = require("mongoose");

let ProductSchema = new mongoose.Schema
    (
        {
            name: String,
            price: Number,
            colour: String,
            size: String,
            noOfUnits: Number,
            description: String,

            images:
            [
                {
                    url: String,
                    filename: String,
                }
                // 0 small: String, CART
                // 1 medium: String, INDEX

                // 2 large1: String, SHOW
                // 3 large2: String, SHOW
                // 4 large3: String, SHOW
            ],
            
            specifications:
            {
                "Dimensions": String,
                "Finish": String,
                "Mounting Mechanism": String,
                "Type of wood": String,
                "Shape": String,
                "Weight (in kg)": String
            },

            productNumber: Number,
            category: String,
            modelNumber: Number,

            reviews:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Review"
                }
            ],

            averageRating:
            {
                type: Number,
                default: 0.0
            }
        }
    );

module.exports = mongoose.model("Product", ProductSchema);