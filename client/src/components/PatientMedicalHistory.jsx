import { useEffect, useState } from "react";

import {
    CalendarDays,
    UserRound,
    Stethoscope,
    Activity,
    Pill,
    AlertTriangle,
    ClipboardList,
    FileText,
    RefreshCw
} from "lucide-react";

import {
    getMedicalRecordsByPatient
} from "../services/medicalRecordService";

import "./PatientMedicalHistory.css";


function PatientMedicalHistory({
    patientId
}) {

    const [records, setRecords] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    ==================================================
    LOAD PATIENT MEDICAL HISTORY
    ==================================================
    */

    const loadHistory = async () => {

        if (
            patientId === undefined ||
            patientId === null ||
            patientId === ""
        ) {

            setRecords([]);
            setLoading(false);

            return;

        }


        try {

            setLoading(true);
            setError("");


            const response =
                await getMedicalRecordsByPatient(
                    patientId
                );


            setRecords(
                response?.records || []
            );

        } catch (err) {

            console.error(
                "Failed to load patient medical history:",
                err
            );


            setError(
                err?.message ||
                "Unable to load medical history."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    ==================================================
    LOAD ON PATIENT CHANGE
    ==================================================
    */

    useEffect(() => {

        loadHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId]);


    /*
    ==================================================
    FORMAT DATE
    ==================================================
    */

    const formatDate = (date) => {

        if (!date) {
            return "Date unavailable";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Date unavailable";

        }


        return parsedDate.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /*
    ==================================================
    FORMAT TIME
    ==================================================
    */

    const formatTime = (date) => {

        if (!date) {
            return "";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return parsedDate.toLocaleTimeString(
            "en-NG",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /*
    ==================================================
    EMPTY
    ==================================================
    */

    if (
        !loading &&
        !error &&
        records.length === 0
    ) {

        return (

            <section className="patient-history">

                <div className="patient-history-header">

                    <div>

                        <h2>
                            Medical History
                        </h2>

                        <p>
                            Clinical history and previous visits
                        </p>

                    </div>

                </div>


                <div className="patient-history-empty">

                    <ClipboardList
                        size={42}
                    />

                    <h3>
                        No medical history yet
                    </h3>

                    <p>
                        Medical records for this patient
                        will appear here after their first
                        clinical visit.
                    </p>

                </div>

            </section>

        );

    }


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <section className="patient-history">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="patient-history-header">

                <div>

                    <div className="patient-history-title-row">

                        <ClipboardList
                            size={22}
                        />

                        <h2>
                            Medical History
                        </h2>

                    </div>

                    <p>
                        Previous clinical visits,
                        diagnoses and treatments
                    </p>

                </div>


                <button
                    className="patient-history-refresh"
                    onClick={loadHistory}
                    disabled={loading}
                    title="Refresh medical history"
                >

                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "patient-history-spinning"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="patient-history-error">

                    <AlertTriangle
                        size={20}
                    />

                    <div>

                        <strong>
                            Unable to load medical history
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        onClick={loadHistory}
                    >
                        Try again
                    </button>

                </div>

            )}


            {/* ======================================
                LOADING
            ====================================== */}

            {loading && (

                <div className="patient-history-loading">

                    <div className="patient-history-spinner" />

                    <p>
                        Loading clinical history...
                    </p>

                </div>

            )}


            {/* ======================================
                RECORD TIMELINE
            ====================================== */}

            {!loading &&
                !error &&
                records.length > 0 && (

                <div className="patient-history-timeline">

                    {records.map(
                        (record, index) => {

                            const recordId =
                                record.record_id ??
                                record.medical_record_id ??
                                record.id ??
                                index;


                            return (

                                <article
                                    key={`patient-history-${recordId}`}
                                    className="patient-history-card"
                                >


                                    {/* ==================================
                                        TIMELINE MARKER
                                    ================================== */}

                                    <div className="patient-history-marker">

                                        <div className="patient-history-dot" />

                                        {index <
                                            records.length - 1 && (

                                            <div className="patient-history-line" />

                                        )}

                                    </div>


                                    {/* ==================================
                                        VISIT CARD
                                    ================================== */}

                                    <div className="patient-history-visit">


                                        {/* VISIT HEADER */}

                                        <div className="patient-history-visit-header">

                                            <div>

                                                <div className="patient-history-date">

                                                    <CalendarDays
                                                        size={16}
                                                    />

                                                    <span>
                                                        {formatDate(
                                                            record.visit_date
                                                        )}
                                                    </span>

                                                    {record.visit_date && (

                                                        <span className="patient-history-time">
                                                            {formatTime(
                                                                record.visit_date
                                                            )}
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="patient-history-record-id">

                                                    Record #
                                                    {recordId}

                                                </div>

                                            </div>


                                            {record.specialization && (

                                                <span className="patient-history-specialization">

                                                    {record.specialization}

                                                </span>

                                            )}

                                        </div>


                                        {/* ==================================
                                            CLINICIAN
                                        ================================== */}

                                        <div className="patient-history-clinician">

                                            <div className="patient-history-info">

                                                <UserRound
                                                    size={17}
                                                />

                                                <div>

                                                    <span>
                                                        Attending doctor
                                                    </span>

                                                    <strong>
                                                        {record.doctor_name ||
                                                            "Doctor not recorded"}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="patient-history-info">

                                                <Stethoscope
                                                    size={17}
                                                />

                                                <div>

                                                    <span>
                                                        Department
                                                    </span>

                                                    <strong>
                                                        {record.specialization ||
                                                            "Not specified"}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ==================================
                                            CHIEF COMPLAINT
                                        ================================== */}

                                        {record.chief_complaint && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <Activity
                                                        size={17}
                                                    />

                                                    Chief Complaint

                                                </div>

                                                <p>
                                                    {record.chief_complaint}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            SYMPTOMS
                                        ================================== */}

                                        {record.symptoms && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <Activity
                                                        size={17}
                                                    />

                                                    Symptoms

                                                </div>

                                                <p>
                                                    {record.symptoms}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            HISTORY OF PRESENT ILLNESS
                                        ================================== */}

                                        {record.history_of_present_illness && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <FileText
                                                        size={17}
                                                    />

                                                    History of Present Illness

                                                </div>

                                                <p>
                                                    {record.history_of_present_illness}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            VITALS
                                        ================================== */}

                                        {(
                                            record.blood_pressure ||
                                            record.temperature ||
                                            record.pulse_rate ||
                                            record.respiratory_rate ||
                                            record.oxygen_saturation ||
                                            record.weight ||
                                            record.height
                                        ) && (

                                            <div className="patient-history-vitals">

                                                <div className="patient-history-section-title">

                                                    <Activity
                                                        size={17}
                                                    />

                                                    Vitals

                                                </div>


                                                <div className="patient-history-vitals-grid">

                                                    {record.blood_pressure && (

                                                        <div>
                                                            <span>
                                                                Blood pressure
                                                            </span>

                                                            <strong>
                                                                {record.blood_pressure}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.temperature && (

                                                        <div>
                                                            <span>
                                                                Temperature
                                                            </span>

                                                            <strong>
                                                                {record.temperature}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.pulse_rate && (

                                                        <div>
                                                            <span>
                                                                Pulse rate
                                                            </span>

                                                            <strong>
                                                                {record.pulse_rate}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.respiratory_rate && (

                                                        <div>
                                                            <span>
                                                                Respiratory rate
                                                            </span>

                                                            <strong>
                                                                {record.respiratory_rate}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.oxygen_saturation && (

                                                        <div>
                                                            <span>
                                                                Oxygen saturation
                                                            </span>

                                                            <strong>
                                                                {record.oxygen_saturation}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.weight && (

                                                        <div>
                                                            <span>
                                                                Weight
                                                            </span>

                                                            <strong>
                                                                {record.weight}
                                                            </strong>
                                                        </div>

                                                    )}


                                                    {record.height && (

                                                        <div>
                                                            <span>
                                                                Height
                                                            </span>

                                                            <strong>
                                                                {record.height}
                                                            </strong>
                                                        </div>

                                                    )}

                                                </div>

                                            </div>

                                        )}


                                        {/* ==================================
                                            DIAGNOSIS
                                        ================================== */}

                                        {record.diagnosis && (

                                            <div className="patient-history-section patient-history-diagnosis">

                                                <div className="patient-history-section-title">

                                                    <ClipboardList
                                                        size={17}
                                                    />

                                                    Diagnosis

                                                </div>

                                                <p>
                                                    {record.diagnosis}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            PRESCRIPTION
                                        ================================== */}

                                        {record.prescription && (

                                            <div className="patient-history-section patient-history-prescription">

                                                <div className="patient-history-section-title">

                                                    <Pill
                                                        size={17}
                                                    />

                                                    Prescription

                                                </div>

                                                <p>
                                                    {record.prescription}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            ALLERGIES
                                        ================================== */}

                                        {record.allergies && (

                                            <div className="patient-history-section patient-history-allergies">

                                                <div className="patient-history-section-title">

                                                    <AlertTriangle
                                                        size={17}
                                                    />

                                                    Allergies

                                                </div>

                                                <p>
                                                    {record.allergies}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            TREATMENT PLAN
                                        ================================== */}

                                        {record.treatment_plan && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <ClipboardList
                                                        size={17}
                                                    />

                                                    Treatment Plan

                                                </div>

                                                <p>
                                                    {record.treatment_plan}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            INVESTIGATIONS
                                        ================================== */}

                                        {record.investigation_notes && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <FileText
                                                        size={17}
                                                    />

                                                    Investigations

                                                </div>

                                                <p>
                                                    {record.investigation_notes}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            NOTES
                                        ================================== */}

                                        {record.notes && (

                                            <div className="patient-history-section">

                                                <div className="patient-history-section-title">

                                                    <FileText
                                                        size={17}
                                                    />

                                                    Clinical Notes

                                                </div>

                                                <p>
                                                    {record.notes}
                                                </p>

                                            </div>

                                        )}


                                        {/* ==================================
                                            FOLLOW UP
                                        ================================== */}

                                        {record.follow_up_date && (

                                            <div className="patient-history-follow-up">

                                                <CalendarDays
                                                    size={17}
                                                />

                                                <div>

                                                    <span>
                                                        Follow-up appointment
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            record.follow_up_date
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </article>

                            );

                        }
                    )}

                </div>

            )}

        </section>

    );

}


export default PatientMedicalHistory;