
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const Notification = require("../models/Notification");

// Record student boarding or drop-off using a QR code
const scanStudentQR = async (req, res) => {
    try {
        const { studentId, action } = req.body;

        if (!studentId || !["BOARD", "DROP"].includes(action)) {
            return res.status(400).json({
                message: "Provide studentId and action: BOARD or DROP"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const userId = req.user.id || req.user._id || req.user.userId;
        const driver = await Driver.findOne({ userId });

        if (!driver || !driver.busId) {
            return res.status(400).json({
                message: "Driver profile or assigned bus not found"
            });
        }

        const bus = await Bus.findById(driver.busId);

        if (!bus || bus.status !== "Active") {
            return res.status(400).json({
                message: "Assigned bus not found or inactive"
            });
        }

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Student must be assigned to this bus
        if (!student.busId || student.busId.toString() !== driver.busId.toString()) {
            return res.status(403).json({
                message: "This student is not assigned to your bus"
            });
        }

        const attendanceDate = new Date().toISOString().slice(0, 10);

        let attendance = await Attendance.findOne({
            studentId,
            busId: driver.busId,
            attendanceDate
        });

        const now = new Date();

        if (action === "BOARD") {
            if (attendance && attendance.boardingTime) {
                return res.status(409).json({
                    message: "Student boarding is already recorded today"
                });
            }

            if (!attendance) {
                attendance = new Attendance({
                    studentId,
                    busId: driver.busId,
                    driverId: driver._id,
                    attendanceDate
                });
            }

            attendance.boardingTime = now;
            attendance.dropOffTime = null;
            attendance.status = "Boarded";
        } else {
            if (!attendance || !attendance.boardingTime) {
                return res.status(400).json({
                    message: "Record boarding before drop-off"
                });
            }

            if (attendance.dropOffTime) {
                return res.status(409).json({
                    message: "Student drop-off is already recorded today"
                });
            }

            attendance.dropOffTime = now;
            attendance.status = "Dropped Off";
        }

        await attendance.save();

        // Create a notification for the student's parent
if (student.parentId) {
    const message = action === "BOARD"
        ? `${student.name} has boarded the school bus.`
        : `${student.name} has been dropped off from the school bus.`;

    await Notification.create({
        parentId: student.parentId,
        studentId: student._id,
        message,
        type: action === "BOARD" ? "BOARDING" : "DROPOFF"
    });
}

        return res.status(200).json({
            message: action === "BOARD"
                ? "Student boarding recorded successfully"
                : "Student drop-off recorded successfully",
            attendance
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Attendance record already exists; please retry"
            });
        }

        return res.status(500).json({
            message: "Failed to record attendance",
            error: error.message
        });
    }
};

// View attendance records
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate("studentId")
            .populate("busId")
            .populate("driverId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: attendance.length,
            attendance
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch attendance",
            error: error.message
        });
    }
};

// Driver views attendance for their assigned bus
const getMyBusAttendance = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const driver = await Driver.findOne({ userId });

        if (!driver || !driver.busId) {
            return res.status(200).json({ attendance: [] });
        }

        const today = new Date().toISOString().slice(0, 10);
        const attendance = await Attendance.find({
            busId: driver.busId,
            attendanceDate: today
        })
            .populate("studentId")
            .populate("busId")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            count: attendance.length,
            attendance
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch driver attendance",
            error: error.message
        });
    }
};

// Parent views attendance history for their children
const getMyChildrenAttendance = async (req, res) => {
    try {
        const parentId = req.user.id || req.user._id || req.user.userId;
        const students = await Student.find({ parentId }).select("_id");
        const studentIds = students.map((s) => s._id);

        const attendance = await Attendance.find({
            studentId: { $in: studentIds }
        })
            .populate("studentId")
            .populate("busId")
            .populate("driverId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: attendance.length,
            attendance
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch children attendance",
            error: error.message
        });
    }
};

module.exports = {
    scanStudentQR,
    getAttendance,
    getMyBusAttendance,
    getMyChildrenAttendance
};
