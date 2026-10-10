
const express = require("express");

const {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver
} = require("../controllers/driverController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create driver - Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createDriver
);

// Get all drivers - Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllDrivers
);

// Get one driver - Admin only
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getDriverById
);

// Update driver - Admin only
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateDriver
);

// Delete driver - Admin only
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteDriver
);

module.exports = router;
