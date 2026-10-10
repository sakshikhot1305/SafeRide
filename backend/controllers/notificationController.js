
const Notification = require("../models/Notification");

// Get notifications for the logged-in parent
const getParentNotifications = async (req, res) => {
    try {
        const parentId = req.user.id || req.user._id || req.user.userId;
        console.log("Decoded user:", req.user);
        console.log("Parent ID used:", parentId);
        const notifications = await Notification.find({ parentId })
            .populate("studentId", "name studentId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: notifications.length,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};

// Mark a notification as read
const markNotificationRead = async (req, res) => {
    try {
        const parentId = req.user.id || req.user._id || req.user.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, parentId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
};

module.exports = {
    getParentNotifications,
    markNotificationRead
};
