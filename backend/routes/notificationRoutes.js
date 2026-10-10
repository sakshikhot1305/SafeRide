
const express = require("express");
const router = express.Router();

const {
    getParentNotifications,
    markNotificationRead
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Get notifications for the logged-in parent
router.get(
    "/",
    authMiddleware,
    roleMiddleware("parent"),
    getParentNotifications
);

// Mark a notification as read
router.patch(
    "/:id/read",
    authMiddleware,
    roleMiddleware("parent"),
    markNotificationRead
);

module.exports = router;
