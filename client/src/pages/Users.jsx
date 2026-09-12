import { showToast } from "../utils/notificationService";

import { useEffect, useState } from "react";

import {
    getUsers,
    updateUser
} from "../services/authService";

import AddUserForm from "../components/AddUserForm";

import "./Users.css";
import { formatUserId } from "../utils/hospitalIds";


const ROLES = [

    {
        value: "admin",
        label: "Administrator"
    },

    {
        value: "doctor",
        label: "Doctor"
    },

    {
        value: "nurse",
        label: "Nurse"
    },

    {
        value: "receptionist",
        label: "Receptionist"
    },

    {
        value: "cashier",
        label: "Cashier"
    },

    {
        value: "accountant",
        label: "Accountant"
    },

    {
        value: "pharmacist",
        label: "Pharmacist"
    },

    {
        value: "lab_technician",
        label: "Laboratory Technician"
    },

    {
        value: "staff",
        label: "Staff"
    }

];


function Users() {

    // ==========================================
    // STATE
    // ==========================================

    const [users, setUsers] =
        useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState(null);

    const [editData, setEditData] =
        useState({

            username: "",

            email: "",

            role: ""

        });

    const [loading, setLoading] =
        useState(true);

    const [savingEdit, setSavingEdit] =
        useState(false);


    /*
    ==================================================
    LOAD USERS
    ==================================================
    */

    const loadUsers = async () => {

        try {

            setLoading(true);


            const data =
                await getUsers();


            setUsers(
                data.users || []
            );

        } catch (error) {

            console.error(
                "Failed to load users:",
                error
            );


            showToast(

                error.response?.data?.message ||

                "Failed to load users."

            );

        } finally {

            setLoading(false);

        }

    };


    /*
    ==================================================
    INITIAL LOAD
    ==================================================
    */

    useEffect(() => {

        loadUsers();

    }, []);


    /*
    ==================================================
    USER CREATED
    ==================================================
    */

    const handleUserCreated = async () => {

        setShowForm(false);

        await loadUsers();

    };


    /*
    ==================================================
    CANCEL CREATE FORM
    ==================================================
    */

    const handleCancel = () => {

        setShowForm(false);

    };


    /*
    ==================================================
    TOGGLE CREATE FORM
    ==================================================
    */

    const toggleForm = () => {

        setShowForm(
            (current) => !current
        );

    };


    /*
    ==================================================
    OPEN EDIT USER
    ==================================================
    */

    const handleEditUser = (
        user
    ) => {

        setEditingUser(user);


        setEditData({

            username:
                user.username || "",

            email:
                user.email || "",

            role:
                user.role || "staff"

        });

    };


    /*
    ==================================================
    CLOSE EDIT USER
    ==================================================
    */

    const handleCloseEdit = () => {

        setEditingUser(null);


        setEditData({

            username: "",

            email: "",

            role: ""

        });

    };


    /*
    ==================================================
    HANDLE EDIT CHANGE
    ==================================================
    */

    const handleEditChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setEditData(
            (previous) => ({

                ...previous,

                [name]: value

            })
        );

    };


    /*
    ==================================================
    SAVE USER EDIT
    ==================================================
    */

    const handleSaveEdit = async (
        event
    ) => {

        event.preventDefault();


        if (!editingUser) {

            return;

        }


        try {

            setSavingEdit(true);


            await updateUser(

                editingUser.user_id,

                editData

            );


            showToast(
                "User updated successfully!"
            );


            handleCloseEdit();


            await loadUsers();

        } catch (error) {

            console.error(

                "Failed to update user:",

                error

            );


            showToast(

                error.response?.data?.message ||

                error.response?.data?.error ||

                "Failed to update user."

            );

        } finally {

            setSavingEdit(false);

        }

    };


    /*
    ==================================================
    FORMAT ROLE
    ==================================================
    */

    const formatRole = (
        role
    ) => {

        const foundRole =
            ROLES.find(
                (item) =>
                    item.value === role
            );


        return (
            foundRole?.label ||
            "Unknown"
        );

    };


    /*
    ==================================================
    FORMAT DATE
    ==================================================
    */

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "—";

        }


        return new Date(
            date
        ).toLocaleDateString(

            "en-NG",

            {

                year: "numeric",

                month: "short",

                day: "numeric"

            }

        );

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="hms-page page-container users-page">


            {/* ======================================
                PAGE HEADER
            ====================================== */}

            <div className="top-bar">

                <div>

                    <h1 className="page-title">

                        User Management

                    </h1>


                    <p>

                        Manage staff accounts and system access.
                        and system access.

                    </p>

                </div>


                <button

                    type="button"

                    className="create-user-top-btn"

                    onClick={toggleForm}

                >

                    {

                        showForm

                            ? "Close"

                            : "+ Create User"

                    }

                </button>

            </div>


            {/* ======================================
                CREATE USER FORM
            ====================================== */}

            {

                showForm && (

                    <div className="user-form-card">


                        <div className="form-card-header">

                            <div>

                                <h2>

                                    Create New User

                                </h2>


                                <p>

                                    Create an account and assign
                                    the appropriate system role.

                                </p>

                            </div>

                        </div>


                        <AddUserForm

                            onUserCreated={
                                handleUserCreated
                            }

                            onCancel={
                                handleCancel
                            }

                        />

                    </div>

                )

            }


            {/* ======================================
                USERS TABLE
            ====================================== */}

            <div className="users-card">


                {/* ==================================
                    TABLE HEADER
                ================================== */}

                <div className="users-card-header">

                    <div>

                        <h2>

                            System Users

                        </h2>


                        <p>

                            Accounts currently registered
                            in Hospital Management System.

                        </p>

                    </div>


                    <span className="user-count">

                        {users.length}

                        {" "}

                        User

                        {

                            users.length !== 1

                                ? "s"

                                : ""

                        }

                    </span>

                </div>


                {/* ==================================
                    LOADING
                ================================== */}

                {

                    loading ? (

                        <div className="users-state">

                            <div className="state-spinner" />


                            <p>

                                Loading users...

                            </p>

                        </div>

                    ) : users.length === 0 ? (

                        <div className="users-state">


                            <div className="empty-users-icon">

                                👥

                            </div>


                            <h3>

                                No users found

                            </h3>


                            <p>

                                There are currently no system
                                users to display.

                            </p>

                        </div>

                    ) : (

                        <div className="users-table-wrapper">


                            <table>


                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>


                                        <th>
                                            User
                                        </th>


                                        <th>
                                            Email
                                        </th>


                                        <th>
                                            Role
                                        </th>


                                        <th>
                                            Created
                                        </th>


                                        <th className="actions-header">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {

                                        users.map(
                                            (user) => (

                                                <tr

                                                    key={
                                                        user.user_id
                                                    }

                                                >


                                                    {/* ID */}

                                                    <td className="id-cell">

                                                        {formatUserId(user.user_id)}

                                                    </td>


                                                    {/* USER */}

                                                    <td>

                                                        <div className="user-table-profile">


                                                            <div className="user-table-avatar">

                                                                {

                                                                    user.username
                                                                        ?.charAt(0)
                                                                        ?.toUpperCase()

                                                                }

                                                            </div>


                                                            <div className="user-table-name">

                                                                <strong>

                                                                    {

                                                                        user.username

                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* EMAIL */}

                                                    <td>

                                                        <span className="email-cell">

                                                            {

                                                                user.email

                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ROLE */}

                                                    <td>

                                                        <span

                                                            className={
                                                                `role-badge ${user.role || "staff"}`
                                                            }

                                                        >

                                                            {

                                                                formatRole(
                                                                    user.role
                                                                )

                                                            }

                                                        </span>

                                                    </td>


                                                    {/* CREATED */}

                                                    <td>

                                                        {

                                                            formatDate(
                                                                user.created_at
                                                            )

                                                        }

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <button

                                                            type="button"

                                                            className="edit-user-btn"

                                                            onClick={() =>
                                                                handleEditUser(
                                                                    user
                                                                )
                                                            }

                                                        >

                                                            Edit

                                                        </button>

                                                    </td>


                                                </tr>

                                            )

                                        )

                                    }

                                </tbody>

                            </table>

                        </div>

                    )

                }

            </div>


            {/* ======================================
                EDIT USER MODAL
            ====================================== */}

            {

                editingUser && (

                    <div className="edit-user-overlay">


                        <div className="edit-user-modal">


                            {/* HEADER */}

                            <div className="edit-user-header">


                                <div>

                                    <span className="edit-user-eyebrow">

                                        USER MANAGEMENT

                                    </span>


                                    <h2>

                                        Edit User

                                    </h2>


                                    <p>

                                        Update the user's account
                                        information and system role.

                                    </p>

                                </div>


                                <button

                                    type="button"

                                    className="edit-user-close"

                                    onClick={
                                        handleCloseEdit
                                    }

                                    disabled={
                                        savingEdit
                                    }

                                >

                                    ×

                                </button>

                            </div>


                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSaveEdit
                                }
                            >


                                {/* USERNAME */}

                                <div className="edit-user-group">

                                    <label>

                                        Username

                                    </label>


                                    <input

                                        type="text"

                                        name="username"

                                        value={
                                            editData.username
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                        disabled={
                                            savingEdit
                                        }

                                        required

                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="edit-user-group">

                                    <label>

                                        Email Address

                                    </label>


                                    <input

                                        type="email"

                                        name="email"

                                        value={
                                            editData.email
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                        disabled={
                                            savingEdit
                                        }

                                        required

                                    />

                                </div>


                                {/* ROLE */}

                                <div className="edit-user-group">

                                    <label>

                                        User Role

                                    </label>


                                    <select

                                        name="role"

                                        value={
                                            editData.role
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                        disabled={
                                            savingEdit
                                        }

                                        required

                                    >

                                        {

                                            ROLES.map(
                                                (role) => (

                                                    <option

                                                        key={
                                                            role.value
                                                        }

                                                        value={
                                                            role.value
                                                        }

                                                    >

                                                        {
                                                            role.label
                                                        }

                                                    </option>

                                                )
                                            )

                                        }

                                    </select>

                                </div>


                                {/* ACTIONS */}

                                <div className="edit-user-actions">


                                    <button

                                        type="button"

                                        className="edit-user-cancel"

                                        onClick={
                                            handleCloseEdit
                                        }

                                        disabled={
                                            savingEdit
                                        }

                                    >

                                        Cancel

                                    </button>


                                    <button

                                        type="submit"

                                        className="edit-user-save"

                                        disabled={
                                            savingEdit
                                        }

                                    >

                                        {

                                            savingEdit

                                                ? "Saving Changes..."

                                                : "Save Changes"

                                        }

                                    </button>


                                </div>

                            </form>

                        </div>

                    </div>

                )

            }


        </div>

    );

}


export default Users;