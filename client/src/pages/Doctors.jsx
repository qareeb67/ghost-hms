import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    Plus,
    Pencil,
    Trash2,
    UserRound,
    Stethoscope,
    Building2,
    ShieldCheck,
    ShieldAlert,
    Clock3,
    BadgeCheck,
    RefreshCw,
    Mail,
    GraduationCap
} from "lucide-react";

import {
    getDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor
} from "../services/doctorService";

import AddDoctorForm
    from "../components/AddDoctorForm";

import "./Doctors.css";


function Doctors() {

    /*
    ==================================================
    STATE
    ==================================================
    */

    const [doctors, setDoctors] =
        useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingDoctor, setEditingDoctor] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);


    /*
    ==================================================
    USER / PERMISSIONS
    ==================================================
    */

    const storedUser = useMemo(() => {

        try {

            return JSON.parse(
                localStorage.getItem("user")
            );

        } catch {

            return null;

        }

    }, []);


    const userRole =
        storedUser?.role || "staff";


    const isAdmin =
        userRole === "admin";


    /*
    ==================================================
    SERVER ID
    ==================================================
    */

    const getDoctorServerId = (
        doctor
    ) => {

        if (
            doctor?.doctor_id !== undefined &&
            doctor?.doctor_id !== null
        ) {

            return String(
                doctor.doctor_id
            );

        }

        return null;

    };


    /*
    ==================================================
    LOCAL INDEXEDDB ID
    ==================================================
    */

    const getDoctorLocalId = (
        doctor
    ) => {

        if (
            doctor?.id !== undefined &&
            doctor?.id !== null
        ) {

            return String(
                doctor.id
            );

        }

        return null;

    };


    /*
    ==================================================
    STABLE REACT KEY
    ==================================================
    */

    const getDoctorKey = (
        doctor,
        index
    ) => {

        const serverId =
            getDoctorServerId(
                doctor
            );

        if (serverId) {

            return (
                `server-doctor-${serverId}`
            );

        }


        const localId =
            getDoctorLocalId(
                doctor
            );

        if (localId) {

            return (
                `local-doctor-${localId}`
            );

        }


        return (
            `doctor-fallback-${index}`
        );

    };


    /*
    ==================================================
    DOCTOR NAME
    ==================================================
    */

    const getDoctorName = (
        doctor
    ) => {

        return [

            doctor?.first_name,

            doctor?.middle_name,

            doctor?.last_name

        ]

            .filter(Boolean)

            .join(" ");

    };


    /*
    ==================================================
    QUALIFICATION SUMMARY
    ==================================================
    */

    const getQualificationSummary = (
        doctor
    ) => {

        if (
            !Array.isArray(
                doctor?.qualifications
            )
        ) {

            return null;

        }


        if (
            doctor.qualifications.length === 0
        ) {

            return null;

        }


        return doctor.qualifications
            .map(
                qualification =>
                    qualification?.qualification
            )
            .filter(Boolean)
            .join(", ");

    };


    /*
    ==================================================
    DEDUPLICATE DOCTORS
    ==================================================
    */

    const normalizeDoctors = (
        doctorList
    ) => {

        const uniqueDoctors = [];

        const seen =
            new Set();


        doctorList.forEach(
            (
                doctor,
                index
            ) => {

                const serverId =
                    getDoctorServerId(
                        doctor
                    );

                const localId =
                    getDoctorLocalId(
                        doctor
                    );


                const identity =
                    serverId
                        ? `server-${serverId}`
                        : localId
                            ? `local-${localId}`
                            : `fallback-${index}`;


                if (
                    seen.has(identity)
                ) {

                    console.warn(
                        "⚠️ Duplicate doctor ignored:",
                        doctor
                    );

                    return;

                }


                seen.add(
                    identity
                );


                uniqueDoctors.push(
                    doctor
                );

            }
        );


        return uniqueDoctors;

    };


    /*
    ==================================================
    LOAD DOCTORS
    ==================================================
    */

    const loadDoctors = async (
        showRefreshing = false
    ) => {

        try {

            if (showRefreshing) {

                setRefreshing(true);

            } else {

                setLoading(true);

            }


            const data =
                await getDoctors();


            const doctorList =
                Array.isArray(
                    data?.doctors
                )
                    ? data.doctors
                    : [];


            const cleanDoctors =
                normalizeDoctors(
                    doctorList
                );




            setDoctors(
                cleanDoctors
            );

        } catch (error) {

            console.error(
                "❌ Failed to load doctors:",
                error
            );

            setDoctors([]);

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    /*
    ==================================================
    INITIAL LOAD
    ==================================================
    */

    useEffect(() => {

        loadDoctors();

        const handleSyncComplete = () => {
            loadDoctors();
        };

        const handleOnline = () => {
            loadDoctors();
        };

        window.addEventListener(
            "ghost-hms-sync-complete",
            handleSyncComplete
        );

        window.addEventListener(
            "online",
            handleOnline
        );

        return () => {
            window.removeEventListener(
                "ghost-hms-sync-complete",
                handleSyncComplete
            );

            window.removeEventListener(
                "online",
                handleOnline
            );
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /*
    ==================================================
    SAVE DOCTOR
    ==================================================
    */

    const handleSaveDoctor =
        async (
            doctor
        ) => {

            try {

                /*
                ======================================
                UPDATE
                ======================================
                */

                if (editingDoctor) {

                    const doctorId =
                        editingDoctor.doctor_id ??
                        editingDoctor.id;


                    if (
                        doctorId === undefined ||
                        doctorId === null
                    ) {

                        throw new Error(
                            "Cannot update doctor: doctor ID is missing."
                        );

                    }


                    const result =
                        await updateDoctor(
                            doctorId,
                            doctor
                        );


                    if (
                        result?.offline
                    ) {

                        showToast(
                            "Doctor updated offline. It will synchronize when the connection returns."
                        );

                    } else {

                        showToast(
                            "Doctor updated successfully."
                        );

                    }

                }


                /*
                ======================================
                CREATE
                ======================================
                */

                else {

                    const result =
                        await createDoctor(
                            doctor
                        );


                    if (
                        result?.offline
                    ) {

                        showToast(
                            "Doctor saved offline. It will synchronize when the connection returns."
                        );

                    } else {

                        showToast(
                            "Doctor added successfully."
                        );

                    }

                }


                /*
                ======================================
                CLOSE FORM
                ======================================
                */

                setShowForm(false);

                setEditingDoctor(null);


                /*
                ======================================
                REFRESH
                ======================================
                */

                await loadDoctors(
                    true
                );

            } catch (error) {

                console.error(
                    "❌ Failed to save doctor:",
                    error
                );


                showToast(
                    error?.message ||
                    "Failed to save doctor."
                );

            }

        };


    /*
    ==================================================
    DELETE DOCTOR
    ==================================================
    */

    const handleDelete =
        async (
            doctor
        ) => {

            if (!isAdmin) {

                showToast(
                    "Access denied. Only administrators can delete doctors."
                );

                return;

            }


            const doctorId =
                doctor?.doctor_id ??
                doctor?.id;


            if (
                doctorId === undefined ||
                doctorId === null
            ) {

                showToast(
                    "Cannot delete doctor: doctor ID is missing."
                );

                return;

            }


            const doctorName =
                getDoctorName(
                    doctor
                );


            const confirmDelete = await confirmAction({
                title: "Delete doctor?",
                message: `Are you sure you want to delete ${doctorName || "this doctor"}? This action cannot be undone.`,
                confirmText: "Delete doctor",
            });


            if (!confirmDelete) {

                return;

            }


            try {

                const result =
                    await deleteDoctor(
                        doctorId
                    );


                if (
                    result?.offline
                ) {

                    showToast(
                        "Doctor deleted offline. The deletion will synchronize when the connection returns."
                    );

                } else {

                    showToast(
                        "Doctor deleted successfully."
                    );

                }


                await loadDoctors(
                    true
                );

            } catch (error) {

                console.error(
                    "❌ Failed to delete doctor:",
                    error
                );


                showToast(
                    error?.message ||
                    "Failed to delete doctor."
                );

            }

        };


    /*
    ==================================================
    EDIT DOCTOR
    ==================================================
    */

    const handleEdit =
        (
            doctor
        ) => {

            if (!isAdmin) {

                showToast(
                    "Access denied. Only administrators can edit doctor information."
                );

                return;

            }


            setEditingDoctor(
                doctor
            );

            setShowForm(
                true
            );

        };


    /*
    ==================================================
    ADD DOCTOR
    ==================================================
    */

    const handleAddDoctor =
        () => {

            if (!isAdmin) {

                showToast(
                    "Access denied. Only administrators can add doctors."
                );

                return;

            }


            setEditingDoctor(
                null
            );

            setShowForm(
                true
            );

        };


    /*
    ==================================================
    SEARCH
    ==================================================
    */

    const filteredDoctors =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();


            if (!query) {

                return doctors;

            }


            return doctors.filter(
                doctor => {

                    const name =
                        getDoctorName(
                            doctor
                        )
                            .toLowerCase();


                    const qualification =
                        getQualificationSummary(
                            doctor
                        )
                            ?.toLowerCase() ||
                        "";


                    return (

                        name.includes(
                            query
                        )

                        ||

                        String(
                            doctor.doctor_number ||
                            doctor.doctor_id ||
                            ""
                        )
                            .toLowerCase()
                            .includes(query)

                        ||

                        doctor.specialization
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        doctor.specialization_name
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        doctor.department_name
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        doctor.email
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        doctor.phone
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        doctor.mdcn_number
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        qualification.includes(
                            query
                        )

                    );

                }
            );

        }, [
            doctors,
            search
        ]);


    /*
    ==================================================
    STATUS HELPERS
    ==================================================
    */

    const getSyncStatus =
        (
            doctor
        ) => {

            const isPending =
                doctor?._syncStatus ===
                "pending";

            const isLocalOnly =
                doctor?._localOnly ===
                true;


            if (
                isPending ||
                isLocalOnly
            ) {

                return {

                    label:
                        "Pending sync",

                    className:
                        "pending",

                    icon:
                        <RefreshCw
                            size={14}
                        />

                };

            }


            return {

                label:
                    "Synced",

                className:
                    "synced",

                icon:
                    <BadgeCheck
                        size={14}
                    />

            };

        };


    const getEmploymentStatus =
        (
            doctor
        ) => {

            return (
                doctor?.employment_status ||
                "Not specified"
            );

        };


    const getMDCNStatus =
        (
            doctor
        ) => {

            return (
                doctor?.mdcn_status ||
                "Not specified"
            );

        };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="hms-page page-container doctors-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="doctors-page-header">

                <div className="doctors-page-heading">

                    <div className="doctors-page-icon">

                        <Stethoscope
                            size={24}
                        />

                    </div>


                    <div>

                        <h1 className="page-title">
                            Doctors
                        </h1>

                        <p className="doctors-page-subtitle">
                            Manage doctors, professional
                            credentials and employment information.
                        </p>

                    </div>

                </div>


                <div className="doctors-header-actions">


                    <button
                        type="button"
                        className="doctors-refresh-btn"
                        onClick={() =>
                            loadDoctors(true)
                        }
                        disabled={
                            refreshing
                        }
                        title="Refresh doctors"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "doctors-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    {isAdmin && (

                        <button
                            type="button"
                            className="add-doctor-btn"
                            onClick={
                                handleAddDoctor
                            }
                        >

                            <Plus
                                size={18}
                            />

                            Add Doctor

                        </button>

                    )}

                </div>

            </div>


            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="doctors-summary-grid">


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon">

                        <UserRound
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Total Doctors
                        </span>

                        <strong>
                            {doctors.length}
                        </strong>

                    </div>

                </div>


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon">

                        <BadgeCheck
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>

                            {
                                doctors.filter(
                                    doctor =>
                                        doctor.employment_status ===
                                        "Active"
                                ).length
                            }

                        </strong>

                    </div>

                </div>


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon">

                        <ShieldCheck
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            MDCN Active
                        </span>

                        <strong>

                            {
                                doctors.filter(
                                    doctor =>
                                        doctor.mdcn_status ===
                                        "Active"
                                ).length
                            }

                        </strong>

                    </div>

                </div>


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon">

                        <RefreshCw
                            size={19}
                        />

                    </div>

                    <div>

                        <span>
                            Pending Sync
                        </span>

                        <strong>

                            {
                                doctors.filter(
                                    doctor =>
                                        doctor._syncStatus ===
                                        "pending" ||
                                        doctor._localOnly ===
                                        true
                                ).length
                            }

                        </strong>

                    </div>

                </div>

            </div>


            {/* ==========================================
                SEARCH BAR
            ========================================== */}

            <div className="doctors-toolbar">

                <div className="doctors-search-wrapper">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        className="doctors-search"
                        placeholder="Search by name, doctor number, specialization, department, MDCN, phone or email..."
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />


                    {search && (

                        <button
                            type="button"
                            className="doctors-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                        >

                            ×

                        </button>

                    )}

                </div>


                <div className="doctors-result-count">

                    {filteredDoctors.length}

                    {" "}

                    {filteredDoctors.length === 1
                        ? "doctor"
                        : "doctors"}

                </div>

            </div>


            {/* ==========================================
                FORM
            ========================================== */}

            {showForm && (

                <AddDoctorForm

                    doctor={
                        editingDoctor
                    }

                    onSave={
                        handleSaveDoctor
                    }

                    onCancel={() => {

                        setShowForm(
                            false
                        );

                        setEditingDoctor(
                            null
                        );

                    }}

                />

            )}


            {/* ==========================================
                LOADING
            ========================================== */}

            {loading ? (

                <div className="doctors-state-card">

                    <div className="doctors-loading-spinner">

                        <RefreshCw
                            size={24}
                        />

                    </div>

                    <h3>
                        Loading doctors
                    </h3>

                    <p>
                        Loading the latest doctor records...
                    </p>

                </div>

            ) : filteredDoctors.length === 0 ? (

                /* ======================================
                   EMPTY
                ====================================== */

                <div className="doctors-state-card">

                    <div className="doctors-empty-icon">

                        {
                            search
                                ? <Search
                                    size={26}
                                  />
                                : <Stethoscope
                                    size={26}
                                  />
                        }

                    </div>


                    <h3>

                        {
                            search
                                ? "No doctors found"
                                : "No doctors yet"
                        }

                    </h3>


                    <p>

                        {
                            search
                                ? "Try a different search term or clear the search."
                                : "Add your first doctor to begin building the medical staff directory."
                        }

                    </p>


                    {search ? (

                        <button
                            type="button"
                            className="doctors-secondary-btn"
                            onClick={() =>
                                setSearch("")
                            }
                        >

                            Clear Search

                        </button>

                    ) : isAdmin ? (

                        <button
                            type="button"
                            className="add-doctor-btn"
                            onClick={
                                handleAddDoctor
                            }
                        >

                            <Plus
                                size={18}
                            />

                            Add First Doctor

                        </button>

                    ) : null}

                </div>

            ) : (

                /* ======================================
                   TABLE
                ====================================== */

                <div className="doctors-table-wrapper">

                    <table className="doctors-table">

                        <thead>

                            <tr>

                                <th>
                                    Doctor
                                </th>

                                <th>
                                    Doctor No.
                                </th>

                                <th>
                                    Specialization
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Qualification
                                </th>

                                <th>
                                    Experience
                                </th>

                                <th>
                                    MDCN
                                </th>

                                <th>
                                    Employment
                                </th>

                                <th>
                                    Sync
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredDoctors.map(
                                (
                                    doctor,
                                    index
                                ) => {

                                    const syncStatus =
                                        getSyncStatus(
                                            doctor
                                        );


                                    const qualification =
                                        getQualificationSummary(
                                            doctor
                                        );


                                    return (

                                        <tr
                                            key={
                                                getDoctorKey(
                                                    doctor,
                                                    index
                                                )
                                            }
                                        >


                                            {/* DOCTOR */}

                                            <td>

                                                <div className="doctor-identity-cell">

                                                    <div className="doctor-avatar">

                                                        <UserRound
                                                            size={18}
                                                        />

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getDoctorName(
                                                                    doctor
                                                                ) ||
                                                                "Unnamed Doctor"
                                                            }
                                                        </strong>


                                                        <span>

                                                            {doctor.email
                                                                ? (
                                                                    <>
                                                                        <Mail
                                                                            size={12}
                                                                        />

                                                                        {
                                                                            doctor.email
                                                                        }
                                                                    </>
                                                                )
                                                                : (
                                                                    "No email"
                                                                )}

                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DOCTOR NUMBER */}

                                            <td>

                                                <span className="doctor-number">

                                                    {
                                                        doctor.doctor_number ||
                                                        (
                                                            doctor.doctor_id
                                                                ? `DOC-${doctor.doctor_id}`
                                                                : "Pending"
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* SPECIALIZATION */}

                                            <td>

                                                <div className="doctor-specialization-cell">

                                                    <Stethoscope
                                                        size={15}
                                                    />

                                                    <span>

                                                        {
                                                            doctor.specialization_name ||
                                                            doctor.specialization ||
                                                            "Not specified"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>

                                                <div className="doctor-department-cell">

                                                    <Building2
                                                        size={15}
                                                    />

                                                    <span>

                                                        {
                                                            doctor.department_name ||
                                                            "Not assigned"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* QUALIFICATION */}

                                            <td>

                                                <div className="doctor-qualification-cell">

                                                    <GraduationCap
                                                        size={15}
                                                    />

                                                    <span>

                                                        {
                                                            qualification ||
                                                            "Not available"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* EXPERIENCE */}

                                            <td>

                                                <div className="doctor-experience-cell">

                                                    <Clock3
                                                        size={15}
                                                    />

                                                    {
                                                        doctor.years_of_experience ??
                                                        0
                                                    }

                                                    {" "}
                                                    yrs

                                                </div>

                                            </td>


                                            {/* MDCN */}

                                            <td>

                                                <div className="doctor-mdcn-cell">

                                                    {
                                                        doctor.mdcn_status ===
                                                        "Active"
                                                            ? (
                                                                <ShieldCheck
                                                                    size={15}
                                                                />
                                                            )
                                                            : (
                                                                <ShieldAlert
                                                                    size={15}
                                                                />
                                                            )
                                                    }


                                                    <span>

                                                        {
                                                            getMDCNStatus(
                                                                doctor
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* EMPLOYMENT */}

                                            <td>

                                                <span
                                                    className={`
                                                        doctor-employment-status
                                                        ${
                                                            getEmploymentStatus(
                                                                doctor
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )
                                                        }
                                                    `}
                                                >

                                                    {
                                                        getEmploymentStatus(
                                                            doctor
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* SYNC */}

                                            <td>

                                                <span
                                                    className={`
                                                        doctor-status
                                                        ${syncStatus.className}
                                                    `}
                                                >

                                                    {
                                                        syncStatus.icon
                                                    }

                                                    {
                                                        syncStatus.label
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="doctor-actions">


                                                    <button
                                                        type="button"
                                                        className={`
                                                            doctor-action-btn
                                                            doctor-edit-btn
                                                            ${
                                                                !isAdmin
                                                                    ? "doctor-action-disabled"
                                                                    : ""
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleEdit(
                                                                doctor
                                                            )
                                                        }
                                                        title={
                                                            isAdmin
                                                                ? "Edit doctor"
                                                                : "Only administrators can edit doctors"
                                                        }
                                                    >

                                                        <Pencil
                                                            size={15}
                                                        />

                                                        Edit

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={`
                                                            doctor-action-btn
                                                            doctor-delete-btn
                                                            ${
                                                                !isAdmin
                                                                    ? "doctor-action-disabled"
                                                                    : ""
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleDelete(
                                                                doctor
                                                            )
                                                        }
                                                        title={
                                                            isAdmin
                                                                ? "Delete doctor"
                                                                : "Only administrators can delete doctors"
                                                        }
                                                    >

                                                        <Trash2
                                                            size={15}
                                                        />

                                                        Delete

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default Doctors;