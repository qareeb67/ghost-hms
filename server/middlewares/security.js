const crypto = require("crypto");

const isProduction =
    process.env.NODE_ENV === "production";

const normalizeOrigin = (value) =>
    String(value || "")
        .trim()
        .replace(/\/$/, "");

const allowedOrigins = new Set(
    [
        ...(process.env.CORS_ORIGINS || "")
            .split(",")
            .map(normalizeOrigin)
            .filter(Boolean),
        ...(isProduction
            ? []
            : [
                  "http://localhost:5173",
                  "http://127.0.0.1:5173"
              ])
    ]
);

const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    if (isProduction && req.secure) {
        res.setHeader(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        );
    }

    next();
};

const corsOrigin = (origin, callback) => {
    // Same-origin requests have no Origin header.
    if (!origin) {
        return callback(null, true);
    }

    if (allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
    }

    return callback(
        new Error("CORS origin is not allowed."),
        false
    );
};

const createRateLimiter = ({
    windowMs,
    max,
    message
}) => {
    const attempts = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key =
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";

        const existing = attempts.get(key);

        if (!existing || now - existing.start >= windowMs) {
            attempts.set(key, {
                start: now,
                count: 1
            });
            return next();
        }

        existing.count += 1;

        if (existing.count > max) {
            const retryAfter = Math.max(
                1,
                Math.ceil(
                    (windowMs -
                        (now - existing.start)) /
                        1000
                )
            );

            res.setHeader(
                "Retry-After",
                String(retryAfter)
            );

            return res.status(429).json({
                success: false,
                message
            });
        }

        return next();
    };
};

const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:
        "Too many authentication attempts. Please try again later."
});

const registerRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message:
        "Too many registration attempts. Please try again later."
});

const validateRequiredEnv = () => {
    const required = [
        "DB_HOST",
        "DB_PORT",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME",
        "JWT_SECRET"
    ];

    const missing = required.filter(
        (name) => !process.env[name]
    );

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(
                ", "
            )}`
        );
    }

    const secret = process.env.JWT_SECRET;
    const entropy = crypto
        .createHash("sha256")
        .update(secret)
        .digest();

    if (isProduction && entropy.length < 32) {
        throw new Error(
            "JWT_SECRET must be configured before production startup."
        );
    }

    if (isProduction && secret.length < 32) {
        throw new Error(
            "JWT_SECRET must be at least 32 characters in production."
        );
    }
};

module.exports = {
    securityHeaders,
    corsOrigin,
    authRateLimiter,
    registerRateLimiter,
    validateRequiredEnv
};
