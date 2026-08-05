const pool = require("../config/db");

const getDashboardStats = async (req, res, next) => {
    try {

        const patients = await pool.query(
            "SELECT COUNT(*) FROM patients"
        );

        const doctors = await pool.query(
            "SELECT COUNT(*) FROM doctors"
        );

        const appointments = await pool.query(
            "SELECT COUNT(*) FROM appointments"
        );

        let revenue = 0;

        try {
            const billing = await pool.query(
                "SELECT COALESCE(SUM(amount),0) AS total FROM billing"
            );

            revenue = billing.rows[0].total;
        } catch {
            revenue = 0;
        }

        res.json({
            patients: Number(patients.rows[0].count),
            doctors: Number(doctors.rows[0].count),
            appointments: Number(appointments.rows[0].count),
            revenue: Number(revenue)
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboardStats
};