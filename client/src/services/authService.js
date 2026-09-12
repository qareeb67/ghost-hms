import api from "./api";


/*
==================================================
LOGIN
==================================================
*/

export const login = async (email, password) => {

    const response = await api.post(
        "/users/login",
        {
            email,
            password,
        }
    );

    return response.data;

};


/*
==================================================
PUBLIC REGISTER
==================================================
*/

export const register = async (
    username,
    email,
    password
) => {

    const response = await api.post(
        "/users/register",
        {
            username,
            email,
            password,
        }
    );

    return response.data;

};


/*
==================================================
ADMIN CREATE USER
==================================================
*/

export const createUser = async (
    username,
    email,
    password,
    role
) => {

    const response = await api.post(
        "/users/admin-create",
        {
            username,
            email,
            password,
            role,
        }
    );

    return response.data;

};
/*
==================================================
ADMIN UPDATE USER
==================================================
*/

export const updateUser = async (
    userId,
    userData
) => {

    const response = await api.put(
        `/users/${userId}`,
        {
            username: userData.username.trim(),

            email: userData.email.trim(),

            role: userData.role
        }
    );

    return response.data;

};

/*
==================================================
GET ALL USERS
==================================================
*/

export const getUsers = async () => {

    const response = await api.get(
        "/users"
    );

    return response.data;

};