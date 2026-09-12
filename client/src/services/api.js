import axios from "axios";


/*
==================================================
AXIOS API CLIENT
==================================================
*/

const API_BASE_URL =
    import.meta.env.VITE_API_URL?.trim() ||
    "http://localhost:5000";


const api = axios.create({

    baseURL: API_BASE_URL,

    headers: {

        "Content-Type": "application/json",

    },

});


/*
==================================================
ATTACH AUTH TOKEN
==================================================

Every protected request automatically receives:

Authorization: Bearer <token>

This keeps authentication centralized instead
of manually adding the token to every service.
==================================================
*/

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


export default api;
