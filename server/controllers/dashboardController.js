const pool = require("../config/db");

const getDashboardStats = async (req, res, next) => {

    try {

        const totalPatients = await pool.query(
            "SELECT COUNT(*) FROM patients"
        );

        const totalDoctors = await pool.query(
            "SELECT COUNT(*) FROM doctors"
        );

        const totalAppointments = await pool.query(
            "SELECT COUNT(*) FROM appointments"
        );

        const completedAppointments = await pool.query(
            "SELECT COUNT(*) FROM appointments WHERE status = 'Completed'"
        );

        const pendingAppointments = await pool.query(
            "SELECT COUNT(*) FROM appointments WHERE status = 'Scheduled'"
        );

       res.status(200).json({
    success: true,
    message: "Dashboard statistics retrieved successfully",
    statistics: {
        totalPatients: Number(totalPatients.rows[0].count),
        totalDoctors: Number(totalDoctors.rows[0].count),
        totalAppointments: Number(totalAppointments.rows[0].count),
        completedAppointments: Number(completedAppointments.rows[0].count),
        pendingAppointments: Number(pendingAppointments.rows[0].count)
    }
});

    } catch (err) {

        next(err);

    }

};

module.exports = {
    getDashboardStats
};