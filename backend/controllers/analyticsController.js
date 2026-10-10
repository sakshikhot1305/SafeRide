
const Student = require("../models/Student");
const Driver = require("../models/Driver");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Attendance = require("../models/Attendance");
const Notification = require("../models/Notification");

const getAdminAnalytics = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const [
            totalStudents,
            activeStudents,
            totalDrivers,
            totalBuses,
            activeBuses,
            totalRoutes,
            todayAttendance,
            totalNotifications,
            unreadNotifications
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: "Active" }),
            Driver.countDocuments(),
            Bus.countDocuments(),
            Bus.countDocuments({ status: "Active" }),
            Route.countDocuments(),
            Attendance.find({ attendanceDate: today }),
            Notification.countDocuments(),
            Notification.countDocuments({ isRead: false })
        ]);

        const boardedStudents = todayAttendance.filter(
            record => record.boardingTime
        ).length;

        const droppedOffStudents = todayAttendance.filter(
            record => record.dropOffTime
        ).length;

        const attendancePercentage = totalStudents > 0
            ? Number(((boardedStudents / totalStudents) * 100).toFixed(2))
            : 0;

        // Daily attendance trend for the last 7 days
        const attendanceTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().slice(0, 10);

            const records = await Attendance.find({
                attendanceDate: dateString
            });

            attendanceTrend.push({
                date: dateString,
                boarded: records.filter(record => record.boardingTime).length,
                droppedOff: records.filter(record => record.dropOffTime).length
            });
        }

        // Count students assigned to each bus
        const studentsPerBus = await Bus.aggregate([
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "busId",
                    as: "students"
                }
            },
            {
                $project: {
                    _id: 0,
                    busId: "$_id",
                    busNumber: "$busNumber",
                    registrationNumber: 1,
                    studentCount: { $size: "$students" }
                }
            }
        ]);

        res.status(200).json({
            message: "Admin analytics fetched successfully",
            date: today,
            summary: {
                totalStudents,
                activeStudents,
                totalDrivers,
                totalBuses,
                activeBuses,
                totalRoutes,
                boardedStudents,
                droppedOffStudents,
                attendancePercentage,
                totalNotifications,
                unreadNotifications
            },
            attendanceTrend,
            studentsPerBus
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admin analytics",
            error: error.message
        });
    }
};

module.exports = { getAdminAnalytics };
