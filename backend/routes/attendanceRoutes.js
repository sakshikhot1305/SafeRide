
const express = require("express");
const router = express.Router();

const {
    scanStudentQR,
    getAttendance,
    getMyBusAttendance,
    getMyChildrenAttendance
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Driver scans a student's QR code
router.post(
    "/scan",
    authMiddleware,
    roleMiddleware("driver"),
    scanStudentQR
);

// Driver views attendance records for their assigned bus
router.get(
    "/my-bus",
    authMiddleware,
    roleMiddleware("driver"),
    getMyBusAttendance
);

// Parent views attendance history for their children
router.get(
    "/my-children",
    authMiddleware,
    roleMiddleware("parent"),
    getMyChildrenAttendance
);

// Admin views attendance records
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAttendance
);

module.exports = router;
