
const mongoose = require("mongoose");
const Student = require("../models/Student");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");

// CREATE STUDENT
const createStudent = async (req, res) => {
    try {
        const {
            studentId,
            name,
            dateOfBirth,
            gender,
            className,
            division,
            parentId,
            busId,
            routeId
        } = req.body;

        // Required field validation
        if (
            !studentId ||
            !name ||
            !dateOfBirth ||
            !gender ||
            !className ||
            !division ||
            !parentId
        ) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        // Check duplicate student ID
        const existingStudent = await Student.findOne({ studentId });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student ID already exists"
            });
        }

        // Validate parent ID
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            return res.status(400).json({
                message: "Invalid parent ID"
            });
        }

        // Check whether parent exists
        const parent = await User.findOne({
            _id: parentId,
            role: "parent"
        });

        if (!parent) {
            return res.status(400).json({
                message: "Parent account not found"
            });
        }

        // Validate bus
        if (busId) {
            if (!mongoose.Types.ObjectId.isValid(busId)) {
                return res.status(400).json({
                    message: "Invalid bus ID"
                });
            }

            const bus = await Bus.findById(busId);

            if (!bus) {
                return res.status(400).json({
                    message: "Bus not found"
                });
            }
        }

        // Validate route
        if (routeId) {
            if (!mongoose.Types.ObjectId.isValid(routeId)) {
                return res.status(400).json({
                    message: "Invalid route ID"
                });
            }

            const route = await Route.findById(routeId);

            if (!route) {
                return res.status(400).json({
                    message: "Route not found"
                });
            }
        }

        // Create student
        const student = await Student.create({
            studentId,
            name,
            dateOfBirth,
            gender,
            className,
            division,
            parentId,
            busId: busId || null,
            routeId: routeId || null,
            qrCode: studentId
        });

        res.status(201).json({
            message: "Student created successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET ALL STUDENTS
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate("parentId", "name email role")
            .populate("busId")
            .populate("routeId");

        res.status(200).json({
            count: students.length,
            students
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET SINGLE STUDENT
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const student = await Student.findById(id)
            .populate("parentId", "name email role")
            .populate("busId")
            .populate("routeId");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            student
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// UPDATE STUDENT
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate student ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        // Find student
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Validate parent if being updated
        if (req.body.parentId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(req.body.parentId)) {
                return res.status(400).json({
                    message: "Invalid parent ID"
                });
            }

            const parent = await User.findOne({
                _id: req.body.parentId,
                role: "parent"
            });

            if (!parent) {
                return res.status(400).json({
                    message: "Parent account not found"
                });
            }
        }

        // Validate bus if being updated
        if (
            req.body.busId !== undefined &&
            req.body.busId !== null &&
            req.body.busId !== ""
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.busId)) {
                return res.status(400).json({
                    message: "Invalid bus ID"
                });
            }

            const bus = await Bus.findById(req.body.busId);

            if (!bus) {
                return res.status(400).json({
                    message: "Bus not found"
                });
            }
        }

        // Validate route if being updated
        if (
            req.body.routeId !== undefined &&
            req.body.routeId !== null &&
            req.body.routeId !== ""
        ) {
            if (!mongoose.Types.ObjectId.isValid(req.body.routeId)) {
                return res.status(400).json({
                    message: "Invalid route ID"
                });
            }

            const route = await Route.findById(req.body.routeId);

            if (!route) {
                return res.status(400).json({
                    message: "Route not found"
                });
            }
        }

        // Only allow these fields to be updated
        const allowedFields = [
            "name",
            "dateOfBirth",
            "gender",
            "className",
            "division",
            "parentId",
            "busId",
            "routeId",
            "status"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                student[field] = req.body[field];
            }
        });

        // Save changes
        await student.save();

        res.status(200).json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// DELETE STUDENT
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate student ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        // Find student
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Delete student
        await student.deleteOne();

        res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET CHILDREN FOR LOGGED IN PARENT
const getMyChildren = async (req, res) => {
    try {
        const parentId = req.user.id || req.user._id || req.user.userId;
        const students = await Student.find({ parentId })
            .populate("busId")
            .populate("routeId");

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

// EXPORT FUNCTIONS
module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyChildren
};
