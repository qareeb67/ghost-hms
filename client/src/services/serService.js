import api from "./api";


// ==================================================
// AUTH
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
// GET CURRENT USER
// ==================================================

export const getCurrentUser = async () => {

    try {

        const response =
            await api.get(
                "/users/me",
                getAuthConfig()
            );


        if (response.data?.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

        }


        return response.data;

    } catch (error) {

        console.error(
            "Failed to get current user:",
            error
        );


        /*
        ==========================================
        OFFLINE FALLBACK
        ==========================================
        */

        const storedUser =
            localStorage.getItem("user");


        if (storedUser) {

            try {

                return {

                    success: true,

                    offline: true,

                    user:
                        JSON.parse(
                            storedUser
                        )

                };

            } catch (parseError) {

                console.error(
                    "Failed to parse stored user:",
                    parseError
                );

            }

        }


        throw error;

    }

};


// ==================================================
// UPDATE CURRENT USER PROFILE
// ==================================================

export const updateCurrentUser = async (
    userData
) => {

    try {

        const response =
            await api.put(
                "/users/me",
                {
                    username:
                        userData.username?.trim(),

                    email:
                        userData.email?.trim()
                },
                getAuthConfig()
            );


        /*
        ==========================================
        UPDATE LOCAL USER
        ==========================================
        */

        if (response.data?.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

        }


        return response.data;

    } catch (error) {

        console.error(
            "Failed to update profile:",
            error
        );


        throw error;

    }

};


// ==================================================
// CHANGE PASSWORD
// ==================================================

export const changePassword = async (
    currentPassword,
    newPassword
) => {

    try {

        const response =
            await api.put(
                "/users/me/password",
                {
                    currentPassword,
                    newPassword
                },
                getAuthConfig()
            );


        return response.data;

    } catch (error) {

        console.error(
            "Failed to change password:",
            error
        );


        throw error;

    }

};