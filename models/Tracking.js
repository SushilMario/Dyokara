const mongoose = require("mongoose");

let TrackingSchema = new mongoose.Schema
(
    {
        name: String,
        currentOrderNumber: Number
    }
);

module.exports = mongoose.model("Tracking", TrackingSchema);