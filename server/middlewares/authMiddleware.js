const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (
        scheme?.toLowerCase() !== "bearer" ||
        !token
    ) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Invalid authorization header."
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(503).json({
            success: false,
            message: "Authentication service is unavailable."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (
            !decoded?.userId ||
            !decoded?.role
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = authenticateToken;
