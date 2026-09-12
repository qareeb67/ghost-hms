const express = require("express");

const router = express.Router();


const authenticateToken =
    require("../middlewares/authMiddleware");


const {

    getNotifications,

    markNotificationAsRead,

    markAllNotificationsAsRead,

    deleteNotification

} = require(
    "../controllers/notificationController"
);


/* ==================================================
   ALL NOTIFICATION ROUTES REQUIRE AUTHENTICATION
================================================== */

router.use(
    authenticateToken
);


/* ==================================================
   GET CURRENT USER NOTIFICATIONS

   GET /notifications
================================================== */

router.get(
    "/",
    getNotifications
);


/* ==================================================
   MARK ALL NOTIFICATIONS AS READ

   PUT /notifications/read-all
================================================== */

router.put(
    "/read-all",
    markAllNotificationsAsRead
);


/* ==================================================
   MARK ONE NOTIFICATION AS READ

   PUT /notifications/:id/read
================================================== */

router.put(
    "/:id/read",
    markNotificationAsRead
);


/* ==================================================
   DELETE NOTIFICATION

   DELETE /notifications/:id
================================================== */

router.delete(
    "/:id",
    deleteNotification
);


module.exports = router;