const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    username: { type:String },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    servicename:{type:String},
    date: { type: Date,default:Date.now() },
    time: { type: String}, // Example: "10:30 AM"
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "completed", "cancelled"], 
        default: "pending" 
    },
    history:{type:[]}
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
