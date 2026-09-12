import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useMemo, useState } from "react";

import {
    Users,
    UserPlus,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    Phone,
} from "lucide-react";

import {
    getPatients,
    createPatient,
    updatePatient,
    deletePatient,
} from "../services/patientService";

import AddPatientForm from "../components/AddPatientForm";
import PatientProfileModal from "../components/PatientProfileModal";

import "./Patients.css";
import { formatPatientId } from "../utils/hospitalIds";


function Patients() {

    /*
    ================================================
    STATE
    ================================================
    */

    const [patients, setPatients] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingPatient, setEditingPatient] = useState(null);

    const [selectedPatient, setSelectedPatient] = useState(null);

    const [search, setSearch] = useState("");


    /*
    ================================================
    LOAD PATIENTS
    ================================================
    */

    const loadPatients = async () => {

        try {

            const data =
                await getPatients();

            setPatients(
                data.patients || []
            );

        } catch (err) {

            console.error(
                "Failed to load patients:",
                err
            );

        }

    };


    useEffect(() => {

        loadPatients();

    }, []);


    /*
    ================================================
    SAVE PATIENT
    ================================================
    */

    const handleSavePatient = async (
        patient
    ) => {

        try {

            if (editingPatient) {

                await updatePatient(
                    editingPatient.patient_id ??
                    editingPatient.id,
                    patient
                );

                showToast(
                    "Patient updated successfully!"
                );

            } else {

                await createPatient(
                    patient
                );

                showToast(
                    "Patient added successfully!"
                );

            }


            setShowForm(false);

            setEditingPatient(null);

            await loadPatients();

        } catch (err) {

            console.error(
                "Failed to save patient:",
                err
            );

            showToast(
                "Failed to save patient."
            );

        }

    };


    /*
    ================================================
    DELETE PATIENT
    ================================================
    */

    const handleDelete = async (
        identifier
    ) => {

        const confirmDelete = await confirmAction({
            title: "Delete patient?",
            message: "Are you sure you want to delete this patient? This action cannot be undone.",
            confirmText: "Delete patient",
        });


        if (!confirmDelete) {

            return;

        }


        try {

            await deletePatient(
                identifier
            );

            await loadPatients();

            showToast(
                "Patient deleted successfully!"
            );

        } catch (error) {

            console.error(
                "Failed to delete patient:",
                error
            );

            showToast(
                "Failed to delete patient."
            );

        }

    };


    /*
    ================================================
    EDIT PATIENT
    ================================================
    */

    const handleEdit = (
        patient
    ) => {

        setEditingPatient(
            patient
        );

        setShowForm(
            true
        );

    };


    /*
    ================================================
    VIEW PATIENT
    ================================================
    */

    const handleView = (
        patient
    ) => {

        setSelectedPatient(
            patient
        );

    };


    /*
    ================================================
    FILTER PATIENTS
    ================================================
    */

    const filteredPatients =
        useMemo(() => {

            const query =
                search
                    .toLowerCase()
                    .trim();


            if (!query) {

                return patients;

            }


            return patients.filter(
                (patient) => {

                    return (

                        patient.first_name
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.last_name
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.patient_number
                            ?.toLowerCase()
                            .includes(query)
                        ||
                        (patient.patient_id !== undefined &&
                            patient.patient_id !== null &&
                            formatPatientId(patient.patient_id)
                                .toLowerCase()
                                .includes(query))

                        ||

                        patient.phone
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.email
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.nationality
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.state
                            ?.toLowerCase()
                            .includes(query)

                        ||

                        patient.lga
                            ?.toLowerCase()
                            .includes(query)

                    );

                }
            );

        }, [
            patients,
            search
        ]);


    /*
    ================================================
    FORMAT DATE
    ================================================
    */

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "N/A";

        }


        return date.split("T")[0];

    };


    /*
    ================================================
    RENDER
    ================================================
    */

    return (

        <div className="hms-page page-container patients-page">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <section className="patients-header">

                <div className="patients-heading">

                    <div className="patients-heading-icon">

                        <Users size={22} />

                    </div>


                    <div>

                        <span className="patients-eyebrow">
                            Patient Management
                        </span>


                        <h1>
                            Patients
                        </h1>


                        <p>
                            Manage patient information and records.
                        </p>

                    </div>

                </div>


                <button
                    className="patients-add-button"
                    onClick={() => {

                        setEditingPatient(
                            null
                        );

                        setShowForm(
                            true
                        );

                    }}
                >

                    <UserPlus size={18} />

                    <span>
                        Register Patient
                    </span>

                </button>

            </section>


            {/* =================================
                SUMMARY
            ================================= */}

            <section className="patient-summary">

                <div className="patient-summary-icon">

                    <Users size={20} />

                </div>


                <div>

                    <span>
                        Total Patients
                    </span>


                    <strong>
                        {patients.length}
                    </strong>

                </div>

            </section>


            {/* =================================
                SEARCH
            ================================= */}

            <section className="patient-search">

                <Search size={19} />


                <input
                    type="text"
                    placeholder="Search by name, hospital number, phone, email, state or LGA..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                {search && (

                    <button
                        className="clear-search"
                        onClick={() =>
                            setSearch("")
                        }
                        aria-label="Clear search"
                    >

                        <X size={16} />

                    </button>

                )}

            </section>


            {/* =================================
                ADD / EDIT FORM
            ================================= */}

            {showForm && (

                <section className="patient-form-wrapper">


                    <div className="patient-form-header">

                        <div>

                            <span>
                                {editingPatient
                                    ? "Patient Management"
                                    : "New Patient"}
                            </span>


                            <h2>
                                {editingPatient
                                    ? "Edit Patient"
                                    : "Register Patient"}
                            </h2>

                        </div>


                        <button
                            className="form-close-button"
                            onClick={() => {

                                setShowForm(
                                    false
                                );

                                setEditingPatient(
                                    null
                                );

                            }}
                            aria-label="Close form"
                        >

                            <X size={20} />

                        </button>

                    </div>


                    <AddPatientForm

                        patient={
                            editingPatient
                        }

                        onSave={
                            handleSavePatient
                        }

                        onCancel={() => {

                            setShowForm(
                                false
                            );

                            setEditingPatient(
                                null
                            );

                        }}

                    />

                </section>

            )}


            {/* =================================
                PATIENT TABLE
            ================================= */}

            <section className="patients-table-card">


                <div className="table-header">

                    <div>

                        <h2>
                            Patient Directory
                        </h2>


                        <p>

                            {filteredPatients.length}{" "}

                            patient
                            {filteredPatients.length !== 1
                                ? "s"
                                : ""}{" "}

                            found

                        </p>

                    </div>

                </div>


                <div className="patients-table-wrapper">

                    <table className="patients-table">


                        <thead>

                            <tr>

                                <th>
                                    Patient
                                </th>


                                <th>
                                    Hospital No.
                                </th>


                                <th>
                                    Gender
                                </th>


                                <th>
                                    Nationality
                                </th>


                                <th>
                                    Location
                                </th>


                                <th>
                                    Phone
                                </th>


                                <th>
                                    Date of Birth
                                </th>


                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            {filteredPatients.length > 0 ? (

                                filteredPatients.map(
                                    (patient) => (

                                        <tr
                                            key={
                                                patient.patient_id ??
                                                patient.id ??
                                                patient.patient_number
                                            }
                                        >


                                            {/* PATIENT */}

                                            <td>

                                                <div className="patient-name-cell">


                                                    <div className="patient-avatar">

                                                        {patient.first_name
                                                            ?.charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>

                                                            {patient.first_name}{" "}

                                                            {patient.last_name}

                                                        </strong>


                                                        <span>

                                                            {patient.email ||
                                                                "No email provided"}

                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* HOSPITAL NUMBER */}

                                            <td>

                                                <div className="patient-number-cell">

                                                    <span className="patient-number">

                                                        {patient.patient_id !== undefined &&
                                                         patient.patient_id !== null
                                                            ? formatPatientId(patient.patient_id)
                                                            : "LOCAL"}

                                                    </span>


                                                    {patient.patient_id && (

                                                        <small>

                                                            ID #{patient.patient_id}

                                                        </small>

                                                    )}

                                                </div>

                                            </td>


                                            {/* GENDER */}

                                            <td>

                                                <span className="gender-badge">

                                                    {patient.gender ||
                                                        "N/A"}

                                                </span>

                                            </td>


                                            {/* NATIONALITY */}

                                            <td>

                                                <span className="nationality-text">

                                                    {patient.nationality ||
                                                        "N/A"}

                                                </span>

                                            </td>


                                            {/* LOCATION */}

                                            <td>

                                                <div className="patient-location">

                                                    <strong>

                                                        {patient.state ||
                                                            "N/A"}

                                                    </strong>


                                                    <span>

                                                        {patient.lga ||
                                                            "LGA not provided"}

                                                    </span>

                                                </div>

                                            </td>


                                            {/* PHONE */}

                                            <td>

                                                <div className="table-contact">

                                                    <Phone size={14} />

                                                    {patient.phone ||
                                                        "N/A"}

                                                </div>

                                            </td>


                                            {/* DATE OF BIRTH */}

                                            <td>

                                                {formatDate(
                                                    patient.date_of_birth
                                                )}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="patient-actions">


                                                    {/* VIEW */}

                                                    <button
                                                        className="action-button view"
                                                        onClick={() =>
                                                            handleView(
                                                                patient
                                                            )
                                                        }
                                                        title="View patient"
                                                    >

                                                        <Eye size={16} />

                                                        <span>
                                                            View
                                                        </span>

                                                    </button>


                                                    {/* EDIT */}

                                                    <button
                                                        className="action-button edit"
                                                        onClick={() =>
                                                            handleEdit(
                                                                patient
                                                            )
                                                        }
                                                        title="Edit patient"
                                                    >

                                                        <Pencil size={16} />

                                                        <span>
                                                            Edit
                                                        </span>

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        className="action-button delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                patient.patient_id ??
                                                                patient.id
                                                            )
                                                        }
                                                        title="Delete patient"
                                                    >

                                                        <Trash2 size={16} />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )

                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="patients-empty"
                                    >

                                        <div>

                                            <Users size={34} />


                                            <h3>
                                                No patients found
                                            </h3>


                                            <p>

                                                {search
                                                    ? "Try a different search term."
                                                    : "Registered patients will appear here."}

                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================
                PATIENT PROFILE MODAL
            ================================= */}

            <PatientProfileModal

                patient={
                    selectedPatient
                }

                onClose={() =>
                    setSelectedPatient(
                        null
                    )
                }

                onEdit={(patient) => {

                    handleEdit(
                        patient
                    );

                    setSelectedPatient(
                        null
                    );

                }}

            />


        </div>

    );

}


export default Patients;