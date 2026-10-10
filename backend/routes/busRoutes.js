
const express = require("express");

const {
    createBus,
    getAllBuses,
    getBusById,
    updateBus,
    deleteBus
} = require("../controllers/busController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create bus - Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createBus
);

// Get all buses - Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllBuses
);

// Get one bus - Admin only
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getBusById
);

// Update bus - Admin only
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateBus
);

// Delete bus - Admin only
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteBus
);

module.exports = router;
