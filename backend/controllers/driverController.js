
const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const User = require("../models/User");
const Student = require("../models/Student");

// CREATE DRIVER PROFILE
const createDriver = async (req, res) => {
    try {
        const { userId, licenseNumber, phone, address, busId } = req.body;

        if (!userId || !licenseNumber || !phone || !address) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId);

        if (!user || user.role !== "driver") {
            return res.status(400).json({
                message: "A valid driver user account is required"
            });
        }

        const existingDriver = await Driver.findOne({
            $or: [
                { userId },
                { licenseNumber }
            ]
        });

        if (existingDriver) {
            return res.status(409).json({
                message: "Driver profile or license number already exists"
            });
        }

        if (busId && !mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        const driver = await Driver.create({
            userId,
            licenseNumber,
            phone,
            address,
            busId: busId || null
        });

        return res.status(201).json({
            message: "Driver profile created successfully",
            driver
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET ALL DRIVERS
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find()
            .populate("userId", "name email role")
            .populate("busId");

        return res.status(200).json({
            count: drivers.length,
            drivers
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



// GET DRIVER USERS (registered user accounts with role 'driver')
const getDriverUsers = async (req, res) => {
    try {
        const existingDrivers = await Driver.find().select("userId");
        const assignedIds = new Set(
            existingDrivers
                .filter(d => d.userId)
                .map(d => d.userId.toString())
        );

        const users = await User.find({ role: "driver" }).select("_id name email");

        const formatted = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            isAssigned: assignedIds.has(u._id.toString())
        }));

        return res.status(200).json({
            count: formatted.length,
            users: formatted
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET SINGLE DRIVER
const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid driver ID"
            });
        }

        const driver = await Driver.findById(id)
            .populate("userId", "name email role")
            .populate("busId");

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        return res.status(200).json({ driver });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// UPDATE DRIVER
const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid driver ID"
            });
        }

        const driver = await Driver.findById(id);

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        const allowedFields = [
            "licenseNumber",
            "phone",
            "address",
            "busId",
            "status"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                driver[field] = req.body[field];
            }
        }

        if (driver.busId && !mongoose.Types.ObjectId.isValid(driver.busId)) {
            return res.status(400).json({
                message: "Invalid bus ID"
            });
        }

        await driver.save();

        return res.status(200).json({
            message: "Driver updated successfully",
            driver
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// DELETE DRIVER PROFILE
const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid driver ID"
            });
        }

        const driver = await Driver.findById(id);

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        await driver.deleteOne();

        return res.status(200).json({
            message: "Driver profile deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET LOGGED-IN DRIVER PROFILE
const getMyDriverProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        let driver = await Driver.findOne({ userId })
            .populate("userId", "name email role")
            .populate("busId");

        if (!driver) {
            const user = await User.findById(userId);
            if (user && user.role === "driver") {
                driver = await Driver.create({
                    userId: user._id,
                    licenseNumber: `DL-${user._id.toString().slice(-6).toUpperCase()}`,
                    phone: "Not Provided",
                    address: "Not Provided",
                    busId: null,
                    status: "Available"
                });
                driver = await Driver.findById(driver._id)
                    .populate("userId", "name email role")
                    .populate("busId");
            } else {
                return res.status(404).json({
                    message: "Driver profile not found"
                });
            }
        }

        return res.status(200).json({ driver });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// GET STUDENTS ON DRIVER'S ASSIGNED BUS
const getMyBusStudents = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const driver = await Driver.findOne({ userId });

        if (!driver || !driver.busId) {
            return res.status(200).json({
                message: "No bus assigned to driver",
                students: []
            });
        }

        const students = await Student.find({ busId: driver.busId, status: "Active" })
            .populate("routeId")
            .populate("parentId", "name email");

        return res.status(200).json({
            count: students.length,
            students
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverUsers,
    getDriverById,
    updateDriver,
    deleteDriver,
    getMyDriverProfile,
    getMyBusStudents
};
