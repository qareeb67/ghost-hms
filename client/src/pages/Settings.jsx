import {
    UserCircle,
    Mail,
    ShieldCheck,
    LockKeyhole,
    Save,
    KeyRound,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getCurrentUser,
    updateCurrentUser,
    changePassword,
} from "../services/serservice";

import "./Settings.css";


function Settings() {

    const navigate = useNavigate();


    /* ==================================================
       USER
    ================================================== */

    const [user, setUser] = useState({

        username: "",

        email: "",

        role: "staff",

    });


    /* ==================================================
       PROFILE FORM
    ================================================== */

    const [profileForm, setProfileForm] = useState({

        username: "",

        email: "",

    });


    /* ==================================================
       PASSWORD FORM
    ================================================== */

    const [passwordForm, setPasswordForm] = useState({

        currentPassword: "",

        newPassword: "",

        confirmPassword: "",

    });


    /* ==================================================
       LOADING
    ================================================== */

    const [loading, setLoading] =
        useState(true);


    const [profileSaving, setProfileSaving] =
        useState(false);


    const [passwordSaving, setPasswordSaving] =
        useState(false);


    /* ==================================================
       MESSAGES
    ================================================== */

    const [profileMessage, setProfileMessage] =
        useState({

            type: "",

            text: "",

        });


    const [passwordMessage, setPasswordMessage] =
        useState({

            type: "",

            text: "",

        });


    /* ==================================================
       LOAD CURRENT USER
    ================================================== */

    useEffect(() => {

        const loadUser = async () => {

            try {

                setLoading(true);


                const response =
                    await getCurrentUser();


                if (response?.user) {

                    const currentUser =
                        response.user;


                    setUser({

                        username:
                            currentUser.username ||
                            "",

                        email:
                            currentUser.email ||
                            "",

                        role:
                            currentUser.role ||
                            "staff",

                    });


                    setProfileForm({

                        username:
                            currentUser.username ||
                            "",

                        email:
                            currentUser.email ||
                            "",

                    });

                }

            } catch (error) {

                console.error(
                    "Failed to load account settings:",
                    error
                );


                setProfileMessage({

                    type: "error",

                    text:
                        error?.response?.data?.message ||
                        "Unable to load your account information.",

                });

            } finally {

                setLoading(false);

            }

        };


        loadUser();

    }, []);


    /* ==================================================
       PROFILE INPUT
    ================================================== */

    const handleProfileChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setProfileForm(
            (previous) => ({

                ...previous,

                [name]: value,

            })
        );


        setProfileMessage({

            type: "",

            text: "",

        });

    };


    /* ==================================================
       PASSWORD INPUT
    ================================================== */

    const handlePasswordChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setPasswordForm(
            (previous) => ({

                ...previous,

                [name]: value,

            })
        );


        setPasswordMessage({

            type: "",

            text: "",

        });

    };


    /* ==================================================
       SAVE PROFILE
    ================================================== */

    const handleProfileSubmit = async (event) => {

        event.preventDefault();


        setProfileMessage({

            type: "",

            text: "",

        });


        const username =
            profileForm.username.trim();


        const email =
            profileForm.email.trim();


        if (!username) {

            setProfileMessage({

                type: "error",

                text:
                    "Username is required.",

            });

            return;

        }


        if (!email) {

            setProfileMessage({

                type: "error",

                text:
                    "Email address is required.",

            });

            return;

        }


        try {

            setProfileSaving(true);


            const response =
                await updateCurrentUser({

                    username,

                    email,

                });


            if (response?.user) {

                const updatedUser =
                    response.user;


                setUser({

                    username:
                        updatedUser.username ||
                        username,

                    email:
                        updatedUser.email ||
                        email,

                    role:
                        updatedUser.role ||
                        user.role,

                });


                setProfileForm({

                    username:
                        updatedUser.username ||
                        username,

                    email:
                        updatedUser.email ||
                        email,

                });

            }


            setProfileMessage({

                type: "success",

                text:
                    response?.message ||
                    "Profile updated successfully.",

            });

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );


            setProfileMessage({

                type: "error",

                text:
                    error?.response?.data?.message ||
                    "Unable to update your profile.",

            });

        } finally {

            setProfileSaving(false);

        }

    };


    /* ==================================================
       CHANGE PASSWORD
    ================================================== */

    const handlePasswordSubmit = async (event) => {

        event.preventDefault();


        setPasswordMessage({

            type: "",

            text: "",

        });


        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordForm;


        if (!currentPassword) {

            setPasswordMessage({

                type: "error",

                text:
                    "Enter your current password.",

            });

            return;

        }


        if (!newPassword) {

            setPasswordMessage({

                type: "error",

                text:
                    "Enter your new password.",

            });

            return;

        }


        if (newPassword.length < 6) {

            setPasswordMessage({

                type: "error",

                text:
                    "New password must be at least 6 characters.",

            });

            return;

        }


        if (newPassword !== confirmPassword) {

            setPasswordMessage({

                type: "error",

                text:
                    "New passwords do not match.",

            });

            return;

        }


        if (
            currentPassword ===
            newPassword
        ) {

            setPasswordMessage({

                type: "error",

                text:
                    "Your new password must be different from your current password.",

            });

            return;

        }


        try {

            setPasswordSaving(true);


            const response =
                await changePassword(
                    currentPassword,
                    newPassword
                );


            setPasswordForm({

                currentPassword: "",

                newPassword: "",

                confirmPassword: "",

            });


            setPasswordMessage({

                type: "success",

                text:
                    response?.message ||
                    "Password changed successfully.",

            });

        } catch (error) {

            console.error(
                "Failed to change password:",
                error
            );


            setPasswordMessage({

                type: "error",

                text:
                    error?.response?.data?.message ||
                    "Unable to change your password.",

            });

        } finally {

            setPasswordSaving(false);

        }

    };


    /* ==================================================
       FORMAT ROLE
    ================================================== */

    const displayRole =
        user.role
            ? user.role.charAt(0).toUpperCase() +
              user.role.slice(1)
            : "Staff";


    /* ==================================================
       LOADING SCREEN
    ================================================== */

    if (loading) {

        return (

            <div className="hms-page settings-page">

                <div className="settings-loading">

                    <div className="settings-spinner" />

                    <p>
                        Loading account settings...
                    </p>

                </div>

            </div>

        );

    }


    /* ==================================================
       PAGE
    ================================================== */

    return (

        <div className="hms-page settings-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="settings-page-header">

                <div>

                    <p className="settings-eyebrow">
                        Account
                    </p>


                    <h1>
                        Account Settings
                    </h1>


                    <p>
                        Manage your Hospital Management System profile
                        and security settings.
                    </p>

                </div>


                <button
                    type="button"
                    className="settings-back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    <ArrowLeft size={17} />

                    Back to Dashboard

                </button>

            </section>


            {/* ==================================================
                ACCOUNT OVERVIEW
            ================================================== */}

            <section className="settings-overview">

                <div className="settings-overview-avatar">

                    {user.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}

                </div>


                <div className="settings-overview-info">

                    <h2>
                        {user.username || "User"}
                    </h2>


                    <p>
                        {user.email ||
                            "No email provided"}
                    </p>

                </div>


                <div className="settings-overview-role">

                    <ShieldCheck size={16} />

                    <span>
                        {displayRole}
                    </span>

                </div>

            </section>


            {/* ==================================================
                PROFILE INFORMATION
            ================================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon">

                        <UserCircle size={20} />

                    </div>


                    <div>

                        <h2>
                            Profile Information
                        </h2>

                        <p>
                            Update your basic account
                            information.
                        </p>

                    </div>

                </div>


                <form
                    className="settings-form"
                    onSubmit={
                        handleProfileSubmit
                    }
                >


                    {/* USERNAME */}

                    <div className="settings-form-grid">

                        <div className="settings-field">

                            <label htmlFor="username">
                                Username
                            </label>


                            <div className="settings-input-wrapper">

                                <UserCircle
                                    size={17}
                                />


                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={
                                        profileForm.username
                                    }
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter username"
                                    autoComplete="username"
                                />

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div className="settings-field">

                            <label htmlFor="email">
                                Email Address
                            </label>


                            <div className="settings-input-wrapper">

                                <Mail
                                    size={17}
                                />


                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={
                                        profileForm.email
                                    }
                                    onChange={
                                        handleProfileChange
                                    }
                                    placeholder="Enter email address"
                                    autoComplete="email"
                                />

                            </div>

                        </div>

                    </div>


                    {/* ROLE */}

                    <div className="settings-readonly">

                        <div className="settings-readonly-icon">

                            <ShieldCheck size={17} />

                        </div>


                        <div>

                            <span>
                                Account Role
                            </span>

                            <strong>
                                {displayRole}
                            </strong>

                        </div>


                        <small>
                            Managed by administrator
                        </small>

                    </div>


                    {/* MESSAGE */}

                    {profileMessage.text && (

                        <div
                            className={`settings-message ${
                                profileMessage.type
                            }`}
                        >

                            {profileMessage.type ===
                            "success" ? (

                                <CheckCircle2
                                    size={17}
                                />

                            ) : (

                                <AlertCircle
                                    size={17}
                                />

                            )}


                            <span>
                                {
                                    profileMessage.text
                                }
                            </span>

                        </div>

                    )}


                    {/* SAVE */}

                    <div className="settings-form-actions">

                        <button
                            type="submit"
                            className="settings-save-button"
                            disabled={
                                profileSaving
                            }
                        >

                            {profileSaving ? (

                                <>
                                    <span className="settings-button-spinner" />
                                    Saving...
                                </>

                            ) : (

                                <>
                                    <Save size={17} />
                                    Save Changes
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </section>


            {/* ==================================================
                SECURITY
            ================================================== */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div className="settings-card-icon">

                        <LockKeyhole size={20} />

                    </div>


                    <div>

                        <h2>
                            Security
                        </h2>

                        <p>
                            Keep your Hospital Management System account
                            secure.
                        </p>

                    </div>

                </div>


                <form
                    className="settings-form"
                    onSubmit={
                        handlePasswordSubmit
                    }
                >


                    <div className="settings-security-grid">


                        {/* CURRENT PASSWORD */}

                        <div className="settings-field">

                            <label htmlFor="currentPassword">

                                Current Password

                            </label>


                            <div className="settings-input-wrapper">

                                <KeyRound
                                    size={17}
                                />


                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={
                                        passwordForm.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                    autoComplete="current-password"
                                />

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="settings-field">

                            <label htmlFor="newPassword">

                                New Password

                            </label>


                            <div className="settings-input-wrapper">

                                <LockKeyhole
                                    size={17}
                                />


                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={
                                        passwordForm.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Minimum 6 characters"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="settings-field">

                            <label htmlFor="confirmPassword">

                                Confirm New Password

                            </label>


                            <div className="settings-input-wrapper">

                                <LockKeyhole
                                    size={17}
                                />


                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={
                                        passwordForm.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Repeat new password"
                                    autoComplete="new-password"
                                />

                            </div>

                        </div>

                    </div>


                    {/* PASSWORD MESSAGE */}

                    {passwordMessage.text && (

                        <div
                            className={`settings-message ${
                                passwordMessage.type
                            }`}
                        >

                            {passwordMessage.type ===
                            "success" ? (

                                <CheckCircle2
                                    size={17}
                                />

                            ) : (

                                <AlertCircle
                                    size={17}
                                />

                            )}


                            <span>
                                {
                                    passwordMessage.text
                                }
                            </span>

                        </div>

                    )}


                    {/* PASSWORD ACTION */}

                    <div className="settings-form-actions">

                        <button
                            type="submit"
                            className="settings-password-button"
                            disabled={
                                passwordSaving
                            }
                        >

                            {passwordSaving ? (

                                <>
                                    <span className="settings-button-spinner" />
                                    Changing Password...
                                </>

                            ) : (

                                <>
                                    <LockKeyhole
                                        size={17}
                                    />

                                    Change Password

                                </>

                            )}

                        </button>

                    </div>

                </form>

            </section>


            {/* ==================================================
                SECURITY NOTE
            ================================================== */}

            <div className="settings-security-note">

                <ShieldCheck size={19} />

                <div>

                    <strong>
                        Your account is protected
                    </strong>

                    <p>
                        Passwords are securely hashed
                        before being stored in the
                        Hospital Management System database.
                    </p>

                </div>

            </div>


        </div>

    );

}


export default Settings;