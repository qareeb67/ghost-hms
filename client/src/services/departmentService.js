import api  from "./api";

/*
==================================================
GHOST HMS — DEPARTMENT SERVICE
==================================================

Purpose:
- Retrieve hospital departments
- Retrieve active departments
- Retrieve one department
- Cache departments locally
- Provide offline fallback

Backend:
GET /departments
GET /departments/active
GET /departments/:id

Departments are reference/master data.
They do NOT need sync queue operations.

==================================================
*/

const DEPARTMENT_CACHE_KEY = "ghost_hms_departments";

/*
==================================================
AUTH
==================================================
*/

const getToken = () => {
    return localStorage.getItem("token");
};

const getAuthConfig = () => {

    const token = getToken();

    return token
        ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        : {};
};

/*
==================================================
ONLINE CHECK
==================================================
*/

const isOnline = () => {
    return navigator.onLine;
};

/*
==================================================
LOCAL CACHE
==================================================
*/

const getCachedDepartments = () => {

    try {

        const cached =
            localStorage.getItem(
                DEPARTMENT_CACHE_KEY
            );

        if (!cached) {
            return [];
        }

        const parsed = JSON.parse(cached);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Failed to read department cache:",
            error
        );

        return [];

    }

};

const cacheDepartments = (departments) => {

    try {

        if (!Array.isArray(departments)) {
            return;
        }

        localStorage.setItem(
            DEPARTMENT_CACHE_KEY,
            JSON.stringify(departments)
        );

    } catch (error) {

        console.error(
            "Failed to cache departments:",
            error
        );

    }

};

/*
==================================================
GET ALL DEPARTMENTS
==================================================
*/

export const getDepartments = async () => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response = await api.get(
                "/departments",
                getAuthConfig()
            );

            const departments =
                Array.isArray(
                    response.data?.departments
                )
                    ? response.data.departments
                    : [];

            /*
            Cache successful response
            */

            cacheDepartments(departments);

            return {
                success: true,
                offline: false,
                departments
            };

        } catch (error) {

            console.warn(
                "Unable to retrieve departments online. Using local cache.",
                error
            );

        }

    }

    /*
    ----------------------------------------------
    OFFLINE FALLBACK
    ----------------------------------------------
    */

    const cachedDepartments =
        getCachedDepartments();

    return {
        success: true,
        offline: true,
        departments: cachedDepartments
    };

};

/*
==================================================
GET ACTIVE DEPARTMENTS
==================================================
*/

export const getActiveDepartments = async () => {

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response = await api.get(
                "/departments/active",
                getAuthConfig()
            );

            const departments =
                Array.isArray(
                    response.data?.departments
                )
                    ? response.data.departments
                    : [];

            /*
            Update local cache with
            the complete active list.
            */

            cacheDepartments(departments);

            return {
                success: true,
                offline: false,
                departments
            };

        } catch (error) {

            console.warn(
                "Unable to retrieve active departments online. Using local cache.",
                error
            );

        }

    }

    /*
    ----------------------------------------------
    OFFLINE FALLBACK
    ----------------------------------------------
    */

    const cachedDepartments =
        getCachedDepartments();

    /*
    Only return active departments
    when the cache contains is_active.
    */

    const activeDepartments =
        cachedDepartments.filter(
            department =>
                department.is_active !== false
        );

    return {
        success: true,
        offline: true,
        departments: activeDepartments
    };

};

/*
==================================================
GET DEPARTMENT BY ID
==================================================
*/

export const getDepartmentById = async (
    departmentId
) => {

    if (!departmentId) {
        return null;
    }

    /*
    ----------------------------------------------
    ONLINE
    ----------------------------------------------
    */

    if (isOnline()) {

        try {

            const response = await api.get(
                `/departments/${departmentId}`,
                getAuthConfig()
            );

            return (
                response.data?.department ||
                null
            );

        } catch (error) {

            console.warn(
                "Unable to retrieve department online.",
                error
            );

        }

    }

    /*
    ----------------------------------------------
    OFFLINE CACHE
    ----------------------------------------------
    */

    const departments =
        getCachedDepartments();

    return (
        departments.find(
            department =>
                String(
                    department.department_id
                ) === String(departmentId)
        ) ||
        null
    );

};

/*
==================================================
CLEAR CACHE
==================================================

Useful during development/testing if
department data changes.

==================================================
*/

export const clearDepartmentCache = () => {

    try {

        localStorage.removeItem(
            DEPARTMENT_CACHE_KEY
        );

    } catch (error) {

        console.error(
            "Failed to clear department cache:",
            error
        );

    }

};