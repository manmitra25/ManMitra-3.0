const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true }, 
    price: { type: Number, required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    availability: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Service", ServiceSchema);
