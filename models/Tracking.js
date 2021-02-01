const mongoose = require("mongoose");

let TrackingSchema = new mongoose.Schema
(
    {
        name: String,
        currentOrderNumber: Number,
        currentLineupNumber: Number,
        announcement: String
    }
);

module.exports = mongoose.model("Tracking", TrackingSchema);