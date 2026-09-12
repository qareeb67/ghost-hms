const errorHandler = (err, req, res, next) => {
    console.error(err?.stack || err);

    if (res.headersSent) {
        return next(err);
    }

    const status = Number.isInteger(err?.status)
        ? err.status
        : err?.statusCode;

    if (err?.message === "CORS origin is not allowed.") {
        return res.status(403).json({
            success: false,
            message: "Origin is not allowed."
        });
    }

    if (err?.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "A record with these details already exists."
        });
    }

    if (err?.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Invalid request data."
        });
    }

    const safeStatus =
        status && status >= 400 && status < 500
            ? status
            : 500;

    const message =
        safeStatus < 500
            ? err?.message || "Request could not be completed."
            : process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err?.message || "Internal Server Error";

    return res.status(safeStatus).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
