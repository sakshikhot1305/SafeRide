const express = require("express");
const router = express.Router();

const {
    updateLocation,
    getBusLocation,
    getBusETA
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

// Admin, parent, or driver checks AI arrival prediction and route delay
router.get(
    "/:busId/eta",
    authMiddleware,
    roleMiddleware("admin", "parent", "driver"),
    getBusETA
);

// Admin or parent checks a bus's latest location
router.get(
    "/:busId",
    authMiddleware,
    roleMiddleware("admin", "parent"),
    getBusLocation
);

module.exports = router;
