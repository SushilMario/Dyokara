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
            production: String,
            stock: String,

            images:
            [
                {
                    url: String,
                    filename: String,
                }
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

            lineupNumber: Number,
            productNumber: Number,
            sizeNumber: Number,
            colourNumber: Number,
            category: String,

            notificationList:
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ],

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