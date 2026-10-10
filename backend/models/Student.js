const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true
        },

        className: {
            type: String,
            required: true,
            trim: true
        },

        division: {
            type: String,
            required: true,
            trim: true
        },

        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            default: null
        },

        routeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Route",
            default: null
        },

        qrCode: {
            type: String,
            unique: true,
            sparse: true
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);