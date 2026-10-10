
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            required: true
        },

        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
            required: true
        },

        boardingTime: {
            type: Date,
            default: null
        },

        dropOffTime: {
            type: Date,
            default: null
        },

        attendanceDate: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Boarded", "Dropped Off"],
            default: "Boarded"
        }
    },
    {
        timestamps: true
    }
);

// One attendance record per student, bus and day
attendanceSchema.index(
    { studentId: 1, busId: 1, attendanceDate: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
