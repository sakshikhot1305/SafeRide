
const mongoose = require("mongoose");
const Route = require("../models/Route");

// CREATE ROUTE
const createRoute = async (req, res) => {
    try {
        const { routeName, startPoint, endPoint, stops } = req.body;

        if (!routeName || !startPoint || !endPoint) {
            return res.status(400).json({
                message: "Route name, start point and end point are required"
            });
        }

        if (stops !== undefined && !Array.isArray(stops)) {
            return res.status(400).json({
                message: "Stops must be an array"
            });
        }

        if (stops) {
            for (const stop of stops) {
                if (
                    !stop.name ||
                    !Number.isFinite(Number(stop.latitude)) ||
                    !Number.isFinite(Number(stop.longitude)) ||
                    Number(stop.latitude) < -90 ||
                    Number(stop.latitude) > 90 ||
                    Number(stop.longitude) < -180 ||
                    Number(stop.longitude) > 180
                ) {
                    return res.status(400).json({
                        message: "Each stop needs a name and valid latitude and longitude"
                    });
                }
            }
        }

        const route = await Route.create({
            routeName,
            startPoint,
            endPoint,
            stops: stops || []
        });

        return res.status(201).json({
            message: "Route created successfully",
            route
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET ALL ROUTES
const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find();

        return res.status(200).json({
            count: routes.length,
            routes
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET ROUTE BY ID
const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid route ID"
            });
        }

        const route = await Route.findById(id);

        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        return res.status(200).json({ route });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// UPDATE ROUTE
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid route ID"
            });
        }

        const route = await Route.findById(id);

        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        const allowedFields = [
            "routeName",
            "startPoint",
            "endPoint",
            "stops",
            "status"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                route[field] = req.body[field];
            }
        }

        if (!route.routeName || !route.startPoint || !route.endPoint) {
            return res.status(400).json({
                message: "Route name, start point and end point are required"
            });
        }

        if (!Array.isArray(route.stops)) {
            return res.status(400).json({
                message: "Stops must be an array"
            });
        }

        for (const stop of route.stops) {
            if (
                !stop.name ||
                !Number.isFinite(Number(stop.latitude)) ||
                !Number.isFinite(Number(stop.longitude)) ||
                Number(stop.latitude) < -90 ||
                Number(stop.latitude) > 90 ||
                Number(stop.longitude) < -180 ||
                Number(stop.longitude) > 180
            ) {
                return res.status(400).json({
                    message: "Each stop needs a name and valid latitude and longitude"
                });
            }
        }

        await route.save();

        return res.status(200).json({
            message: "Route updated successfully",
            route
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// DELETE ROUTE
const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid route ID"
            });
        }

        const route = await Route.findById(id);

        if (!route) {
            return res.status(404).json({
                message: "Route not found"
            });
        }

        await route.deleteOne();

        return res.status(200).json({
            message: "Route deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    deleteRoute
};
