const pool = require("../config/db");


/* ==================================================
   CREATE NOTIFICATION
================================================== */

const createNotification = async (
    userId,
    type,
    title,
    message
) => {

    const result = await pool.query(

        `
        INSERT INTO notifications
        (
            user_id,
            type,
            title,
            message
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING *
        `,

        [
            userId,
            type,
            title,
            message
        ]

    );


    return result.rows[0];

};


/* ==================================================
   GET USER NOTIFICATIONS
================================================== */

const getUserNotifications = async (
    userId
) => {

    const result = await pool.query(

        `
        SELECT
            notification_id,
            user_id,
            type,
            title,
            message,
            is_read,
            created_at

        FROM notifications

        WHERE user_id = $1

        ORDER BY
            is_read ASC,
            created_at DESC
        `,

        [userId]

    );


    return result.rows;

};


/* ==================================================
   MARK NOTIFICATION AS READ
================================================== */

const markNotificationAsRead = async (
    notificationId,
    userId
) => {

    const result = await pool.query(

        `
        UPDATE notifications

        SET is_read = TRUE

        WHERE
            notification_id = $1
            AND user_id = $2

        RETURNING *
        `,

        [
            notificationId,
            userId
        ]

    );


    return result.rows[0];

};


/* ==================================================
   MARK ALL NOTIFICATIONS AS READ
================================================== */

const markAllNotificationsAsRead = async (
    userId
) => {

    const result = await pool.query(

        `
        UPDATE notifications

        SET is_read = TRUE

        WHERE
            user_id = $1
            AND is_read = FALSE

        RETURNING *
        `,

        [userId]

    );


    return result.rows;

};


/* ==================================================
   DELETE NOTIFICATION
================================================== */

const deleteNotification = async (
    notificationId,
    userId
) => {

    const result = await pool.query(

        `
        DELETE FROM notifications

        WHERE
            notification_id = $1
            AND user_id = $2

        RETURNING *
        `,

        [
            notificationId,
            userId
        ]

    );


    return result.rows[0];

};


/* ==================================================
   EXPORTS
================================================== */

module.exports = {

    createNotification,

    getUserNotifications,

    markNotificationAsRead,

    markAllNotificationsAsRead,

    deleteNotification

};