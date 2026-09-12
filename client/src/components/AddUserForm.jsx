import { showToast } from "../utils/notificationService";

import { useEffect, useState } from "react";

import {
    createUser,
    updateUser
} from "../services/authService";

import "./AddUserForm.css";


function AddUserForm({
    user = null,
    onUserCreated,
    onUserUpdated,
    onCancel
}) {

    // ==========================================
    // EDIT MODE
    // ==========================================

    const isEditMode =
        Boolean(user?.user_id);


    // ==========================================
    // FORM STATE
    // ==========================================

    const [formData, setFormData] = useState({

        username: "",

        email: "",

        password: "",

        role: "staff"

    });


    const [loading, setLoading] =
        useState(false);


    // ==========================================
    // LOAD USER INTO FORM
    // ==========================================

    useEffect(() => {

        if (isEditMode) {

            setFormData({

                username:
                    user?.username || "",

                email:
                    user?.email || "",

                password: "",

                role:
                    user?.role || "staff"

            });

        } else {

            setFormData({

                username: "",

                email: "",

                password: "",

                role: "staff"

            });

        }

    }, [user, isEditMode]);


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    // ==========================================
    // HANDLE SUBMIT
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setLoading(true);


            // ==================================
            // EDIT EXISTING USER
            // ==================================

            if (isEditMode) {

                await updateUser(

                    user.user_id,

                    formData.username.trim(),

                    formData.email.trim(),

                    formData.role

                );


                showToast(
                    "User updated successfully!"
                );


                if (onUserUpdated) {

                    await onUserUpdated();

                }


                return;

            }


            // ==================================
            // CREATE NEW USER
            // ==================================

            await createUser(

                formData.username.trim(),

                formData.email.trim(),

                formData.password,

                formData.role

            );


            showToast(
                "User created successfully!"
            );


            // ==================================
            // RESET FORM
            // ==================================

            setFormData({

                username: "",

                email: "",

                password: "",

                role: "staff"

            });


            // ==================================
            // REFRESH USERS PAGE
            // ==================================

            if (onUserCreated) {

                await onUserCreated();

            }

        } catch (error) {

            console.error(

                isEditMode
                    ? "❌ Failed to update user:"
                    : "❌ Failed to create user:",

                error

            );


            showToast(

                error.response?.data?.message ||

                error.response?.data?.error ||

                (
                    isEditMode
                        ? "Failed to update user."
                        : "Failed to create user."
                )

            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <form
            className="add-user-form"
            onSubmit={handleSubmit}
        >


            {/* ==================================
                FORM TITLE
            ================================== */}

            <div className="add-user-form-heading">

                <h3>

                    {isEditMode
                        ? "Edit User"
                        : "Create User"}

                </h3>


                <p>

                    {isEditMode

                        ? "Update the user's account information and system role."

                        : "Create a new staff account and assign the appropriate system role."

                    }

                </p>

            </div>


            {/* ==================================
                USERNAME
            ================================== */}

            <div className="form-group">

                <label htmlFor="username">

                    Username

                </label>


                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

            </div>


            {/* ==================================
                EMAIL
            ================================== */}

            <div className="form-group">

                <label htmlFor="email">

                    Email Address

                </label>


                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                />

            </div>


            {/* ==================================
                PASSWORD
            ================================== */}

            {!isEditMode && (

                <div className="form-group">

                    <label htmlFor="password">

                        Temporary Password

                    </label>


                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        minLength="8"
                        disabled={loading}
                        required
                    />


                    <span className="form-help-text">

                        Password must contain at least
                        8 characters.

                    </span>

                </div>

            )}


            {/* ==================================
                EDIT MODE PASSWORD NOTE
            ================================== */}

            {isEditMode && (

                <div className="form-info-message">

                    <strong>
                        Password unchanged
                    </strong>

                    <span>
                        Leave the password alone here.
                        Password changes can be handled separately.
                    </span>

                </div>

            )}


            {/* ==================================
                USER ROLE
            ================================== */}

            <div className="form-group">

                <label htmlFor="role">

                    User Role

                </label>


                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    required
                >

                    {/* ==========================
                        GENERAL
                    ========================== */}

                    <option value="staff">
                        Staff
                    </option>


                    <option value="admin">
                        Administrator
                    </option>


                    {/* ==========================
                        CLINICAL STAFF
                    ========================== */}

                    <option value="doctor">
                        Doctor
                    </option>


                    <option value="nurse">
                        Nurse
                    </option>


                    {/* ==========================
                        FRONT DESK
                    ========================== */}

                    <option value="receptionist">
                        Receptionist
                    </option>


                    {/* ==========================
                        FINANCE
                    ========================== */}

                    <option value="cashier">
                        Cashier
                    </option>


                    <option value="accountant">
                        Accountant
                    </option>


                    {/* ==========================
                        MEDICAL SERVICES
                    ========================== */}

                    <option value="pharmacist">
                        Pharmacist
                    </option>


                    <option value="lab_technician">
                        Laboratory Technician
                    </option>

                </select>

            </div>


            {/* ==================================
                ACTIONS
            ================================== */}

            <div className="add-user-form-actions">


                <button
                    type="button"
                    className="cancel-user-btn"
                    onClick={onCancel}
                    disabled={loading}
                >

                    Cancel

                </button>


                <button
                    type="submit"
                    className="add-user-btn"
                    disabled={loading}
                >

                    {loading

                        ? (
                            isEditMode
                                ? "Saving Changes..."
                                : "Creating User..."
                        )

                        : (
                            isEditMode
                                ? "Save Changes"
                                : "Create User"
                        )

                    }

                </button>


            </div>

        </form>

    );

}


export default AddUserForm;