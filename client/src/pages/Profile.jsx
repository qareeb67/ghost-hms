import {
    UserCircle,
    ShieldCheck,
    Mail,
    UserRound,
    ArrowLeft,
} from "lucide-react";


import { getCurrentUser } from "../services/serService";

import {
    useNavigate,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import "./Profile.css";


function Profile() {

    const navigate = useNavigate();


    const [user, setUser] = useState({
        username: "User",
        email: "",
        role: "staff",
    });


    useEffect(() => {

        const loadProfile = async () => {

            try {

                const response =
                    await getCurrentUser();


                if (response?.user) {

                    setUser({

                        username:
                            response.user.username ||
                            "User",

                        email:
                            response.user.email ||
                            "",

                        role:
                            response.user.role ||
                            "staff",

                    });

                }

            } catch (error) {

                console.error(
                    "Failed to load profile:",
                    error
                );

            }

        };


        loadProfile();

    }, []);


    const username =
        user.username || "User";


    const role =
        user.role || "staff";


    const displayRole =
        role.charAt(0).toUpperCase() +
        role.slice(1);


    const avatarLetter =
        username
            .charAt(0)
            .toUpperCase();


    return (

        <div className="hms-page profile-page">


            {/* HEADER */}

            <div className="profile-page-header">

                <div>

                    <p className="profile-eyebrow">
                        Account
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your Hospital Management System account
                        information.
                    </p>

                </div>


                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    <ArrowLeft size={17} />

                    Back to Dashboard

                </button>

            </div>


            {/* PROFILE CARD */}

            <div className="profile-card">


                {/* PROFILE HERO */}

                <div className="profile-hero">

                    <div className="profile-large-avatar">

                        {avatarLetter}

                    </div>


                    <div className="profile-hero-info">

                        <h2>
                            {username}
                        </h2>

                        <span>
                            {displayRole}
                        </span>

                    </div>

                </div>


                {/* INFORMATION */}

                <div className="profile-section">

                    <div className="profile-section-header">

                        <div>

                            <h3>
                                Personal Information
                            </h3>

                            <p>
                                Your account information
                            </p>

                        </div>

                    </div>


                    <div className="profile-info-grid">


                        <div className="profile-info-item">

                            <div className="profile-info-icon">

                                <UserRound
                                    size={18}
                                />

                            </div>

                            <div>

                                <span>
                                    Username
                                </span>

                                <strong>
                                    {username}
                                </strong>

                            </div>

                        </div>


                        <div className="profile-info-item">

                            <div className="profile-info-icon">

                                <Mail
                                    size={18}
                                />

                            </div>

                            <div>

                                <span>
                                    Email Address
                                </span>

                                <strong>
                                    {user.email ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>


                        <div className="profile-info-item">

                            <div className="profile-info-icon">

                                <ShieldCheck
                                    size={18}
                                />

                            </div>

                            <div>

                                <span>
                                    Account Role
                                </span>

                                <strong>
                                    {displayRole}
                                </strong>

                            </div>

                        </div>


                        <div className="profile-info-item">

                            <div className="profile-info-icon">

                                <UserCircle
                                    size={18}
                                />

                            </div>

                            <div>

                                <span>
                                    Account Status
                                </span>

                                <strong className="profile-active">
                                    Active
                                </strong>

                            </div>

                        </div>


                    </div>

                </div>


                {/* SETTINGS */}

                <div className="profile-footer">

                    <button
                        type="button"
                        className="profile-settings-button"
                        onClick={() =>
                            navigate("/settings")
                        }
                    >

                        Account Settings

                    </button>

                </div>

            </div>

        </div>

    );

}


export default Profile;