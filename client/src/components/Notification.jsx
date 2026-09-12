import {
    Bell,
    CalendarDays,
    UserPlus,
    FileText,
    CheckCircle2,
    X,
    Check,
    ArrowRight,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../services/notificationService";

import "./Notification.css";


function Notification() {


    /* ==================================================
       NOTIFICATIONS
    ================================================== */

    const [notifications, setNotifications] =
        useState([]);


    /* ==================================================
       LOADING
    ================================================== */

    const [loading, setLoading] =
        useState(true);


    /* ==================================================
       ERROR
    ================================================== */

    const [error, setError] =
        useState(null);


    /* ==================================================
       DROPDOWN
    ================================================== */

    const [isOpen, setIsOpen] =
        useState(false);


    /* ==================================================
       NOTIFICATION CONTAINER REF
    ==================================================

    Used to detect clicks outside the notification
    component and close the dropdown automatically.
    ==================================================
    */

    const notificationRef =
        useRef(null);


    /* ==================================================
       LOAD NOTIFICATIONS
    ================================================== */

    const loadNotifications = async () => {

        try {

            setLoading(true);

            setError(null);


            const response =
                await getNotifications();


            if (
                response &&
                Array.isArray(
                    response.notifications
                )
            ) {

                setNotifications(
                    response.notifications
                );

            } else {

                setNotifications([]);

            }

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );

            setError(
                "Unable to load notifications."
            );

        } finally {

            setLoading(false);

        }

    };


    /* ==================================================
       LOAD ON COMPONENT MOUNT
    ================================================== */

    useEffect(() => {

        loadNotifications();

    }, []);


    /* ==================================================
       CLOSE WHEN CLICKING OUTSIDE
    ==================================================
    */

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const handleOutsideClick = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {

                setIsOpen(false);

            }

        };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, [isOpen]);


    /* ==================================================
       CLOSE WITH ESCAPE
    ==================================================

    Small usability improvement for desktop users.
    ==================================================
    */

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const handleEscape = (event) => {

            if (
                event.key === "Escape"
            ) {

                setIsOpen(false);

            }

        };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [isOpen]);


    /* ==================================================
       NOTIFICATION ICON
    ================================================== */

    const getNotificationIcon = (
        type
    ) => {

        switch (type) {

            case "appointment":

                return (
                    <CalendarDays
                        size={17}
                    />
                );


            case "patient":

                return (
                    <UserPlus
                        size={17}
                    />
                );


            case "record":

                return (
                    <FileText
                        size={17}
                    />
                );


            case "system":

                return (
                    <CheckCircle2
                        size={17}
                    />
                );


            default:

                return (
                    <Bell
                        size={17}
                    />
                );

        }

    };


    /* ==================================================
       UNREAD COUNT
    ================================================== */

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;


    /* ==================================================
       TOGGLE DROPDOWN
    ================================================== */

    const toggleDropdown = () => {

        setIsOpen(
            (previous) =>
                !previous
        );

    };


    /* ==================================================
       MARK ONE AS READ
    ================================================== */

    const handleMarkAsRead = async (
        notificationId
    ) => {

        try {

            await markNotificationAsRead(
                notificationId
            );


            setNotifications(
                (previous) =>
                    previous.map(
                        (notification) =>
                            notification.notification_id ===
                            notificationId
                                ? {
                                    ...notification,
                                    is_read: true,
                                }
                                : notification
                    )
            );

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }

    };


    /* ==================================================
       MARK ALL AS READ
    ================================================== */

    const handleMarkAllAsRead =
        async () => {

            try {

                await markAllNotificationsAsRead();


                setNotifications(
                    (previous) =>
                        previous.map(
                            (notification) => ({
                                ...notification,
                                is_read: true,
                            })
                        )
                );

            } catch (error) {

                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

            }

        };


    /* ==================================================
       DELETE NOTIFICATION
    ================================================== */

    const handleDeleteNotification =
        async (
            notificationId
        ) => {

            try {

                await deleteNotification(
                    notificationId
                );


                setNotifications(
                    (previous) =>
                        previous.filter(
                            (notification) =>
                                notification.notification_id !==
                                notificationId
                        )
                );

            } catch (error) {

                console.error(
                    "Failed to delete notification:",
                    error
                );

            }

        };


    /* ==================================================
       FORMAT TIME
    ================================================== */

    const formatTime = (
        createdAt
    ) => {

        if (!createdAt) {

            return "";

        }


        const date =
            new Date(createdAt);


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        if (minutes < 1) {

            return "Just now";

        }


        if (minutes < 60) {

            return `${minutes} minute${
                minutes === 1
                    ? ""
                    : "s"
            } ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return `${hours} hour${
                hours === 1
                    ? ""
                    : "s"
            } ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {

            return `${days} day${
                days === 1
                    ? ""
                    : "s"
            } ago`;

        }


        return date.toLocaleDateString();

    };


    return (

        <div
            className="notification-container"
            ref={notificationRef}
        >


            {/* ==================================================
                HEADER BUTTON
            ================================================== */}

            <button
                type="button"
                className="notification-button"
                title="Notifications"
                onClick={toggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >

                <Bell size={20} />


                {unreadCount > 0 && (

                    <span className="notification-badge">

                        {unreadCount > 9
                            ? "9+"
                            : unreadCount}

                    </span>

                )}

            </button>


            {/* ==================================================
                DROPDOWN
            ================================================== */}

            {isOpen && (

                <div
                    className="notification-dropdown"
                    role="dialog"
                    aria-label="Notifications"
                >


                    {/* ==================================================
                        DROPDOWN HEADER
                    ================================================== */}

                    <div className="notification-dropdown-header">

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <p>

                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${
                                        unreadCount > 1
                                            ? "s"
                                            : ""
                                    }`
                                    : "You're all caught up"}

                            </p>

                        </div>


                        {unreadCount > 0 && (

                            <button
                                type="button"
                                className="notification-mark-all"
                                onClick={
                                    handleMarkAllAsRead
                                }
                            >

                                <Check
                                    size={14}
                                />

                                Mark all read

                            </button>

                        )}

                    </div>


                    {/* ==================================================
                        NOTIFICATION LIST
                    ================================================== */}

                    <div className="notification-list">


                        {/* LOADING */}

                        {loading && (

                            <div className="notification-empty">

                                <div className="notification-empty-icon">

                                    <Bell
                                        size={22}
                                    />

                                </div>

                                <h4>
                                    Loading notifications
                                </h4>

                                <p>
                                    Checking for new updates...
                                </p>

                            </div>

                        )}


                        {/* ERROR */}

                        {!loading && error && (

                            <div className="notification-empty">

                                <div className="notification-empty-icon">

                                    <Bell
                                        size={22}
                                    />

                                </div>

                                <h4>
                                    Something went wrong
                                </h4>

                                <p>
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        loadNotifications
                                    }
                                >
                                    Try again
                                </button>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            notifications.length === 0 && (

                                <div className="notification-empty">

                                    <div className="notification-empty-icon">

                                        <Bell
                                            size={22}
                                        />

                                    </div>

                                    <h4>
                                        No notifications
                                    </h4>

                                    <p>
                                        You're all caught up.
                                        New updates will appear here.
                                    </p>

                                </div>

                            )}


                        {/* NOTIFICATIONS */}

                        {!loading &&
                            !error &&
                            notifications.length > 0 &&

                            notifications.map(
                                (
                                    notification
                                ) => (

                                    <div
                                        key={
                                            notification.notification_id
                                        }
                                        className={`notification-item ${
                                            !notification.is_read
                                                ? "unread"
                                                : ""
                                        }`}
                                    >


                                        {/* ICON */}

                                        <div className="notification-item-icon">

                                            {getNotificationIcon(
                                                notification.type
                                            )}

                                        </div>


                                        {/* CONTENT */}

                                        <div className="notification-item-content">

                                            <strong>

                                                {
                                                    notification.title
                                                }

                                            </strong>


                                            <p>

                                                {
                                                    notification.message
                                                }

                                            </p>


                                            <span>

                                                {formatTime(
                                                    notification.created_at
                                                )}

                                            </span>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="notification-item-actions">


                                            {!notification.is_read && (

                                                <button
                                                    type="button"
                                                    title="Mark as read"
                                                    onClick={() =>
                                                        handleMarkAsRead(
                                                            notification.notification_id
                                                        )
                                                    }
                                                >

                                                    <Check
                                                        size={14}
                                                    />

                                                </button>

                                            )}


                                            <button
                                                type="button"
                                                title="Remove"
                                                onClick={() =>
                                                    handleDeleteNotification(
                                                        notification.notification_id
                                                    )
                                                }
                                            >

                                                <X
                                                    size={14}
                                                />

                                            </button>


                                        </div>


                                    </div>

                                )
                            )}

                    </div>


                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div className="notification-dropdown-footer">

                        <button
                            type="button"
                            onClick={() =>
                                console.log(
                                    "View all notifications"
                                )
                            }
                        >

                            View all notifications

                            <ArrowRight
                                size={14}
                            />

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Notification;