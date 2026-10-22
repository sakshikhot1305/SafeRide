
const express = require("express");

const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyChildren
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get logged-in parent's children
router.get(
    "/my-children",
    authMiddleware,
    roleMiddleware("parent"),
    getMyChildren
);

// Create student - Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createStudent
);

// Get all students - Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllStudents
);

// Get single student - Admin only
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getStudentById
);

// Update student - Admin only
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateStudent
);

// Delete student - Admin only
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteStudent
);

module.exports = router;
