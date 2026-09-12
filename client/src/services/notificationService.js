import api from "./api";


// ==================================================
// AUTH CONFIG
// ==================================================

const getToken = () => {

    return localStorage.getItem("token");

};


const getAuthConfig = () => {

    return {

        headers: {

            Authorization:
                `Bearer ${getToken()}`

        }

    };

};


// ==================================================
// GET CURRENT USER NOTIFICATIONS
// ==================================================

export const getNotifications = async () => {

    try {

        const response =
            await api.get(
                "/notifications",
                getAuthConfig()
            );


        return response.data;

    } catch (error) {

        console.error(
            "Failed to get notifications:",
            error
        );

        throw error;

    }

};


// ==================================================
// MARK ONE NOTIFICATION AS READ
// ==================================================

export const markNotificationAsRead = async (
    notificationId
) => {

    try {

        const response =
            await api.put(
                `/notifications/${notificationId}/read`,
                {},
                getAuthConfig()
            );


        return response.data;

    } catch (error) {

        console.error(
            "Failed to mark notification as read:",
            error
        );

        throw error;

    }

};


// ==================================================
// MARK ALL NOTIFICATIONS AS READ
// ==================================================

export const markAllNotificationsAsRead =
    async () => {

        try {

            const response =
                await api.put(
                    "/notifications/read-all",
                    {},
                    getAuthConfig()
                );


            return response.data;

        } catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

            throw error;

        }

    };


// ==================================================
// DELETE NOTIFICATION
// ==================================================

export const deleteNotification = async (
    notificationId
) => {

    try {

        const response =
            await api.delete(
                `/notifications/${notificationId}`,
                getAuthConfig()
            );


        return response.data;

    } catch (error) {

        console.error(
            "Failed to delete notification:",
            error
        );

        throw error;

    }

};