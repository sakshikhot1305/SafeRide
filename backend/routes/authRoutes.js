const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");


const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Protected profile accessed successfully",
        user: req.user
    });
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