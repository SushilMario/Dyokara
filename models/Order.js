const mongoose = require("mongoose");

let OrderSchema = new mongoose.Schema
(
    {
        orderNumber: String,
        customer:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }, 
        total: Number,
        items:
        [
            {
                product: 
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity:
                {
                    type: Number,
                    default: 1
                },
                customisation:
                {
                    type: String,
                    default: "None"
                }
            }
        ],
        productIDs: [],
        confirmed:
        {
            type: Boolean, 
            default: false
        }
    }
);

module.exports = mongoose.model("Order", OrderSchema);