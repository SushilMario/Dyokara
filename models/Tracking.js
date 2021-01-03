const mongoose = require("mongoose");

let TrackingSchema = new mongoose.Schema
(
    {
        name: String,
        currentOrderNumber: Number,
        currentProductNumber: Number,
        categories: [String]
    }
);

module.exports = mongoose.model("Tracking", TrackingSchema);