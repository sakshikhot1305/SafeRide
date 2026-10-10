
const express = require("express");
const router = express.Router();

const { getAdminAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin-only analytics endpoint
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminAnalytics
);

module.exports = router;
