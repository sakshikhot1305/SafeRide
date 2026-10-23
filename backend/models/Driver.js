
const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        phone: {
            type: String,
            default: "Not Provided",
            trim: true
        },

        address: {
            type: String,
            default: "Not Provided",
            trim: true
        },

        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            default: null
        },

        status: {
            type: String,
            enum: ["Available", "On Trip", "Inactive"],
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Driver", driverSchema);
