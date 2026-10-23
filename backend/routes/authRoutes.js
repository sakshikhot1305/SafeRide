const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require('../models/User');
const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "Protected profile accessed successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin! You can access this protected API.",
            user: req.user
        });
    }
);
module.exports = router;