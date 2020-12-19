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
        productIDs: [],
        confirmed:
        {
            type: Boolean, 
            default: false
        }
    }
);

module.exports = mongoose.model("Order", OrderSchema);