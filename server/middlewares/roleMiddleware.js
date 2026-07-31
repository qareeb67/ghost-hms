const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        console.log("========== RBAC ==========");
        console.log("Allowed Roles:", allowedRoles);
        console.log("User:", req.user);
        console.log("User Role:", req.user.role);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }

        next();

    };

};

module.exports = authorizeRoles;