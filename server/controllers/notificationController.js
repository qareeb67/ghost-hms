const notificationModel =
    require("../models/notificationModel");


/* ==================================================
   GET CURRENT USER NOTIFICATIONS
================================================== */

const getNotifications = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const notifications =
            await notificationModel
                .getUserNotifications(
                    userId
                );


        res.status(200).json({

            success: true,

            notifications

        });

    } catch (error) {

        next(error);

    }

};


/* ==================================================
   MARK ONE NOTIFICATION AS READ
================================================== */

const markNotificationAsRead = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const notificationId =
            req.params.id;


        const notification =
            await notificationModel
                .markNotificationAsRead(
                    notificationId,
                    userId
                );


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Notification marked as read",

            notification

        });

    } catch (error) {

        next(error);

    }

};


/* ==================================================
   MARK ALL NOTIFICATIONS AS READ
================================================== */

const markAllNotificationsAsRead = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        await notificationModel
            .markAllNotificationsAsRead(
                userId
            );


        res.status(200).json({

            success: true,

            message:
                "All notifications marked as read"

        });

    } catch (error) {

        next(error);

    }

};


/* ==================================================
   DELETE NOTIFICATION
================================================== */

const deleteNotification = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;


        const notificationId =
            req.params.id;


        const notification =
            await notificationModel
                .deleteNotification(
                    notificationId,
                    userId
                );


        if (!notification) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Notification deleted successfully"

        });

    } catch (error) {

        next(error);

    }

};


/* ==================================================
   EXPORTS
================================================== */

module.exports = {

    getNotifications,

    markNotificationAsRead,

    markAllNotificationsAsRead,

    deleteNotification

};