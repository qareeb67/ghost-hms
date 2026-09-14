import { showToast } from "../utils/notificationService";

import { useState } from "react";

import { login } from "../services/authService";

import "./Login.css";

import { useNavigate } from "react-router-dom";


function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    /*
    ==================================================
    LOGIN
    ==================================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);


            const data = await login(
                email,
                password
            );


            /*
            ==========================================
            SAVE AUTHENTICATION DATA
            ==========================================
            */
            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            /*
            ==========================================
            SAVE LOGGED-IN USER
            ==========================================
            */

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            console.info(
                "Hospital Management System login successful."
            );


            showToast(
                "Login Successful!"
            );


            navigate(
                "/dashboard",
                { replace: true }
            );


        } catch (error) {

            console.error(
                "Login failed:",
                error
            );


            showToast(
                error.response?.data?.message ||
                "Invalid email or password"
            );


        } finally {

            setLoading(false);

        }

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="login-container">

            <form
                className="login-card"
                onSubmit={handleSubmit}
            >

                <div className="login-brand">
                    <img
                        src="/logo.png"
                        alt="Hospital Management System logo"
                        className="login-logo"
                    />

                    <div className="login-brand-text">
                        <h1>
                            Hospital Management System
                        </h1>

                        <p>
                            Secure • Offline-ready healthcare management
                        </p>
                    </div>
                </div>


                {/* EMAIL */}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />


                {/* PASSWORD */}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />


                {/* LOGIN */}

                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Signing in..."
                        : "Login"}

                </button>


                {/* ACCOUNT INFORMATION */}

                <p className="auth-info">

                    Account access is managed by
                    your hospital administrator.

                </p>

            </form>

        </div>

    );

}


export default Login;