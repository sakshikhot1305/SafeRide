
const express = require("express");
const router = express.Router();

const {
    scanStudentQR,
    getAttendance
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

// Admin views attendance records
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAttendance
);

module.exports = router;
