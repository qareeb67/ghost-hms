import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarDays,
    FlaskConical,
    Receipt,
    CreditCard,
    Pill,
    FileText,
    Siren,
    LogOut,
    ChevronDown,
    Menu,
    X,
    Hospital,
    UserCircle,
    Settings,
} from "lucide-react";

import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import "./Layout.css";
import Notification from "./Notification";
import { startSyncEngine } from "../services/syncEngine";

function Layout() {

    const navigate = useNavigate();

    const location = useLocation();


    /* ==================================================
       MOBILE SIDEBAR
    ================================================== */

    const [mobileOpen, setMobileOpen] =
        useState(false);


    /* ==================================================
       USER PROFILE DROPDOWN
    ================================================== */

    const [profileOpen, setProfileOpen] =
        useState(false);


    /* ==================================================
       LOGGED-IN USER
    ================================================== */

    const [user, setUser] =
        useState(null);


    /* ==================================================
       START OFFLINE SYNC ENGINE
    ================================================== */

    useEffect(() => {

        const stopSyncEngine =
            startSyncEngine();


        return stopSyncEngine;

    }, []);


    /* ==================================================
       LOAD USER
    ================================================== */

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");


        if (storedUser) {

            try {

                setUser(
                    JSON.parse(storedUser)
                );

            } catch (error) {

                console.error(
                    "Failed to read logged-in user:",
                    error
                );

                localStorage.removeItem("user");

            }

        }

    }, []);


    /* ==================================================
       CLOSE PROFILE MENU WHEN ROUTE CHANGES
    ================================================== */

    useEffect(() => {

        setProfileOpen(false);

    }, [location.pathname]);


    /* ==================================================
       USER INFORMATION
    ================================================== */

    const username =
        user?.username || "User";


    const role =
        user?.role || "staff";


    const displayRole =
        role.charAt(0).toUpperCase() +
        role.slice(1);


    const avatarLetter =
        username.charAt(0).toUpperCase();


    /* ==================================================
       ADMIN CHECK
    ================================================== */

    const isAdmin =
        role === "admin";


    /* ==================================================
       LOGOUT
    ================================================== */

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        setProfileOpen(false);

        navigate(
            "/login",
            {
                replace: true,
            }
        );

    };


    /* ==================================================
       MAIN NAVIGATION
    ================================================== */

    const navigationItems = [

        {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },

        {
            label: "Patients",
            path: "/patients",
            icon: Users,
        },

        {
            label: "Doctors",
            path: "/doctors",
            icon: Stethoscope,
        },

        {
            label: "Appointments",
            path: "/appointments",
            icon: CalendarDays,
        },

    ];


    /* ==================================================
       MANAGEMENT NAVIGATION
    ================================================== */

    const managementItems = [

        {
            label: "Laboratory",
            path: "/laboratory",
            icon: FlaskConical,
        },

        {
            label: "Billing",
            path: "/billing",
            icon: Receipt,
        },
        {
            label: "Payments",
            path: "/payments",
            icon: CreditCard,
        },
        {
            label: "Medicines",
            path: "/medicines",
            icon: Pill,
        },

        {
            label: "Medical Records",
            path: "/medical-records",
            icon: FileText,
        },

        {
            label: "Emergency",
            path: "/emergency",
            icon: Siren,
        },

    ];


    /* ==================================================
       ADMIN NAVIGATION
    ================================================== */

    const adminItems = [

        {
            label: "User Management",
            path: "/users",
            icon: Users,
        },

    ];


    /* ==================================================
       ACTIVE ROUTE
    ================================================== */

    const isActive = (path) => {

        return location.pathname === path;

    };


    /* ==================================================
       NAVIGATION
    ================================================== */

    const handleNavigation = (path) => {

        navigate(path);

        setMobileOpen(false);

        setProfileOpen(false);

    };


    /* ==================================================
       PAGE TITLE
    ================================================== */

    const getPageTitle = () => {

        const currentPath =
            location.pathname;


        const allItems = [

            ...navigationItems,

            ...managementItems,

            ...adminItems,

        ];


        const currentItem =
            allItems.find(
                (item) =>
                    item.path === currentPath
            );


        return currentItem
            ? currentItem.label
            : "Hospital Management System";

    };


    /* ==================================================
       PROFILE MENU
    ================================================== */

    const handleProfileClick = () => {

        setProfileOpen(
            (previous) =>
                !previous
        );

    };


    const goToProfile = () => {

        setProfileOpen(false);

        navigate("/profile");

    };


    const goToSettings = () => {

        setProfileOpen(false);

        navigate("/settings");

    };


    return (

        <div className="dashboard">


            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {mobileOpen && (

                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setMobileOpen(false)
                    }
                />

            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`sidebar ${mobileOpen
                    ? "sidebar-open"
                    : ""
                    }`}
            >


                {/* ==================================================
                    BRAND
                ================================================== */}

                <div className="sidebar-brand">

                    <div className="brand-icon">

                        <Hospital size={24} />

                    </div>


                    <div className="brand-text">

                        <h2>
                            Hospital Management System
                        </h2>

                        <span>
                            Hospital Management
                        </span>

                    </div>


                    <button
                        className="mobile-close"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        type="button"
                    >

                        <X size={22} />

                    </button>

                </div>


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav className="sidebar-navigation">


                    {/* ==================================================
                        MAIN
                    ================================================== */}

                    <div className="navigation-section">

                        <span className="navigation-title">
                            MAIN
                        </span>


                        {navigationItems.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (

                                    <button
                                        key={
                                            item.path
                                        }
                                        type="button"
                                        className={`navigation-item ${isActive(
                                            item.path
                                        )
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            handleNavigation(
                                                item.path
                                            )
                                        }
                                    >

                                        <Icon
                                            size={19}
                                        />

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </button>

                                );

                            }
                        )}

                    </div>


                    {/* ==================================================
                        MANAGEMENT
                    ================================================== */}

                    <div className="navigation-section">

                        <span className="navigation-title">
                            MANAGEMENT
                        </span>


                        {managementItems.map(
                            (item) => {

                                const Icon =
                                    item.icon;


                                return (

                                    <button
                                        key={
                                            item.path
                                        }
                                        type="button"
                                        className={`navigation-item ${isActive(
                                            item.path
                                        )
                                            ? "active"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            handleNavigation(
                                                item.path
                                            )
                                        }
                                    >

                                        <Icon
                                            size={19}
                                        />

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </button>

                                );

                            }
                        )}

                    </div>


                    {/* ==================================================
                        ADMINISTRATION
                        ADMIN ONLY
                    ================================================== */}

                    {isAdmin && (

                        <div className="navigation-section">

                            <span className="navigation-title">
                                ADMINISTRATION
                            </span>


                            {adminItems.map(
                                (item) => {

                                    const Icon =
                                        item.icon;


                                    return (

                                        <button
                                            key={
                                                item.path
                                            }
                                            type="button"
                                            className={`navigation-item ${isActive(
                                                item.path
                                            )
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                handleNavigation(
                                                    item.path
                                                )
                                            }
                                        >

                                            <Icon
                                                size={19}
                                            />

                                            <span>
                                                {
                                                    item.label
                                                }
                                            </span>

                                        </button>

                                    );

                                }
                            )}

                        </div>

                    )}

                </nav>


                {/* ==================================================
                    SIDEBAR BOTTOM
                ================================================== */}

                <div className="sidebar-bottom">


                    <button
                        className="logout-button"
                        onClick={logout}
                        type="button"
                    >

                        <LogOut size={19} />

                        <span>
                            Logout
                        </span>

                    </button>


                    <div className="sidebar-version">

                        <span>
                            Hospital Management System
                        </span>

                        <small>
                            v1.0.0
                        </small>

                    </div>

                </div>

            </aside>


            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <div className="main-area">


                {/* ==================================================
                    TOP HEADER
                ================================================== */}

                <header className="top-header">


                    <div className="header-left">


                        <button
                            className="mobile-menu"
                            onClick={() =>
                                setMobileOpen(true)
                            }
                            type="button"
                        >

                            <Menu size={23} />

                        </button>


                        <div className="page-context">

                            <strong>
                                {
                                    getPageTitle()
                                }
                            </strong>

                        </div>

                    </div>


                    {/* ==================================================
                        HEADER RIGHT
                    ================================================== */}

                    <div className="header-right">


                        {/* ==================================================
    NOTIFICATIONS
================================================== */}

                        <Notification />


                        {/* ==================================================
                            USER PROFILE
                        ================================================== */}

                        <div className="profile-wrapper">


                            <button
                                className={`admin-profile ${profileOpen
                                    ? "profile-open"
                                    : ""
                                    }`}
                                onClick={
                                    handleProfileClick
                                }
                                type="button"
                                aria-expanded={
                                    profileOpen
                                }
                            >

                                <div className="admin-avatar">

                                    {avatarLetter}

                                </div>


                                <div className="admin-info">

                                    <strong>
                                        {username}
                                    </strong>

                                    <span>
                                        {displayRole}
                                    </span>

                                </div>


                                <ChevronDown
                                    size={17}
                                    className={`profile-chevron ${profileOpen
                                        ? "rotate"
                                        : ""
                                        }`}
                                />

                            </button>


                            {/* ==================================================
                                PROFILE DROPDOWN
                            ================================================== */}

                            {profileOpen && (

                                <div className="profile-dropdown">


                                    {/* USER HEADER */}

                                    <div className="profile-dropdown-header">

                                        <div className="profile-dropdown-avatar">

                                            {avatarLetter}

                                        </div>


                                        <div>

                                            <strong>
                                                {username}
                                            </strong>

                                            <span>
                                                {displayRole}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="profile-dropdown-divider" />


                                    {/* MY PROFILE */}

                                    <button
                                        type="button"
                                        className="profile-dropdown-item"
                                        onClick={
                                            goToProfile
                                        }
                                    >

                                        <UserCircle
                                            size={18}
                                        />

                                        <span>
                                            My Profile
                                        </span>

                                    </button>


                                    {/* SETTINGS */}

                                    <button
                                        type="button"
                                        className="profile-dropdown-item"
                                        onClick={goToSettings}
                                    >

                                        <Settings
                                            size={18}
                                        />

                                        <span>
                                            Account Settings
                                        </span>

                                    </button>


                                    {/* ADMIN ONLY */}

                                    {isAdmin && (

                                        <button
                                            type="button"
                                            className="profile-dropdown-item"
                                            onClick={() =>
                                                handleNavigation(
                                                    "/users"
                                                )
                                            }
                                        >

                                            <Users
                                                size={18}
                                            />

                                            <span>
                                                User Management
                                            </span>

                                        </button>

                                    )}


                                    <div className="profile-dropdown-divider" />


                                    {/* LOGOUT */}

                                    <button
                                        type="button"
                                        className="profile-dropdown-item profile-logout"
                                        onClick={logout}
                                    >

                                        <LogOut
                                            size={18}
                                        />

                                        <span>
                                            Logout
                                        </span>

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </header>


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main className="content">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default Layout;