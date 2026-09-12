import { showToast } from "../utils/notificationService";

import { useState } from "react";

import {
    register
} from "../services/authService";

import {
    useNavigate,
    Link
} from "react-router-dom";

import "./Login.css";


function Register() {

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const navigate = useNavigate();


    /*
    ==================================================
    REGISTER USER
    ==================================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            await register(
                username,
                email,
                password
            );


            showToast(
                "Account created successfully! Please log in."
            );


            navigate("/login");


        } catch (error) {

            console.error(
                "Registration failed:",
                error
            );


            showToast(
                error.response?.data?.message ||
                "Failed to create account."
            );

        }

    };


    return (

        <div className="login-container">

            <form
                className="login-card"
                onSubmit={handleSubmit}
            >

                <h1>
                    Hospital Management System
                </h1>


                <p>
                    Create your account
                </p>


                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(
                            e.target.value
                        )
                    }
                    required
                />


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    required
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                    minLength="6"
                    required
                />


                <button type="submit">

                    Create Account

                </button>


                <p className="auth-link">

                    Already have an account?

                    {" "}

                    <Link to="/login">

                        Login

                    </Link>

                </p>

            </form>

        </div>

    );

}


export default Register;