
const express = require("express");
const router = express.Router();

const {
    updateLocation,
    getBusLocation
} = require("../controllers/busTrackingController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Driver sends the bus's current location
router.post(
    "/location",
    authMiddleware,
    roleMiddleware("driver"),
    updateLocation
);

// Admin or parent checks a bus's latest location
router.get(
    "/:busId",
    authMiddleware,
    roleMiddleware("admin", "parent"),
    getBusLocation
);

module.exports = router;
