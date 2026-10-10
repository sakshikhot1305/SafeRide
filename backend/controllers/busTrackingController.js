
const BusTracking = require("../models/BusTracking");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");

// Driver updates the bus's current location
const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, speed } = req.body;

        const lat = Number(latitude);
        const lng = Number(longitude);
        const busSpeed = speed === undefined ? 0 : Number(speed);

        if (
            latitude === undefined ||
            longitude === undefined ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180 ||
            !Number.isFinite(busSpeed) ||
            busSpeed < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid latitude, longitude and speed"
            });
        }

        const userId = req.user.id || req.user._id || req.user.userId;

        const driver = await Driver.findOne({ userId });

        if (!driver) {
            return res.status(404).json({
                message: "Driver profile not found"
            });
        }

        if (!driver.busId) {
            return res.status(400).json({
                message: "No bus is assigned to this driver yet"
            });
        }

        const bus = await Bus.findById(driver.busId);

        if (!bus || bus.status !== "Active") {
            return res.status(400).json({
                message: "Assigned bus not found or is inactive"
            });
        }

        const tracking = await BusTracking.findOneAndUpdate(
            { busId: driver.busId },
            {
                $set: {
                    driverId: driver._id,
                    latitude: lat,
                    longitude: lng,
                    speed: busSpeed,
                    lastUpdated: new Date()
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json({
            message: "Bus location updated successfully",
            tracking
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update bus location",
            error: error.message
        });
    }
};

// Get the latest location of a bus
const getBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;

        if (!busId || !busId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const tracking = await BusTracking.findOne({ busId })
            .populate("busId")
            .populate("driverId");

        if (!tracking) {
            return res.status(404).json({
                message: "Location not available for this bus yet"
            });
        }

        return res.status(200).json({
            message: "Bus location fetched successfully",
            tracking
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch bus location",
            error: error.message
        });
    }
};

module.exports = {
    updateLocation,
    getBusLocation
};
