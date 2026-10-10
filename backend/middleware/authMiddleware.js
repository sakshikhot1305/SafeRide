const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if token is provided
        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // Extract token from "Bearer TOKEN"
        const token = authHeader.split(" ")[1];

        // Check token format
        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information
        req.user = decoded;

        // Continue to the next function
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;