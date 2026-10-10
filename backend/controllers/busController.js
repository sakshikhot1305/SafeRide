
const mongoose = require("mongoose");
const Bus = require("../models/Bus");

// CREATE BUS
const createBus = async (req, res) => {
    try {
        const {
            busNumber,
            registrationNumber,
            capacity
        } = req.body;

        if (!busNumber || !registrationNumber || capacity === undefined) {
            return res.status(400).json({
                message: "Bus number, registration number and capacity are required"
            });
        }

        if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
            return res.status(400).json({
                message: "Capacity must be a positive whole number"
            });
        }

        const existingBus = await Bus.findOne({
            $or: [
                { busNumber },
                { registrationNumber }
            ]
        });

        if (existingBus) {
            return res.status(409).json({
                message: "Bus number or registration number already exists"
            });
        }

        const bus = await Bus.create({
            busNumber,
            registrationNumber,
            capacity: Number(capacity)
        });

        return res.status(201).json({
            message: "Bus created successfully",
            bus
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET ALL BUSES
const getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find();

        return res.status(200).json({
            count: buses.length,
            buses
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET BUS BY ID
const getBusById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const bus = await Bus.findById(id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        return res.status(200).json({ bus });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// UPDATE BUS
const updateBus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const bus = await Bus.findById(id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        const allowedFields = [
            "busNumber",
            "registrationNumber",
            "capacity",
            "status"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                bus[field] = req.body[field];
            }
        }

        if (
            !Number.isInteger(Number(bus.capacity)) ||
            Number(bus.capacity) < 1
        ) {
            return res.status(400).json({
                message: "Capacity must be a positive whole number"
            });
        }

        await bus.save();

        return res.status(200).json({
            message: "Bus updated successfully",
            bus
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Bus number or registration number already exists"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// DELETE BUS
const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const bus = await Bus.findById(id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        await bus.deleteOne();

        return res.status(200).json({
            message: "Bus deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createBus,
    getAllBuses,
    getBusById,
    updateBus,
    deleteBus
};
