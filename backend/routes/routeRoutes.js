
const express = require("express");

const {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    deleteRoute
} = require("../controllers/routeController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create route - Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createRoute
);

// Get all routes - Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllRoutes
);

// Get one route - Admin only
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getRouteById
);

// Update route - Admin only
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateRoute
);

// Delete route - Admin only
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteRoute
);

module.exports = router;
