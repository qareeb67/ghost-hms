import { useEffect, useState } from "react";

import {
    FlaskConical,
    AlertCircle,
    UserRound,
    Stethoscope,
    TestTube2,
    ChevronDown,
    CheckCircle2,
    ClipboardList
} from "lucide-react";

import { getPatients } from "../services/patientService";
import { getDoctors } from "../services/doctorService";

import "./AddLaboratoryForm.css";


function AddLaboratoryForm({
    laboratoryTest,
    onSave,
    onCancel
}) {

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        patient_id: "",
        doctor_id: "",
        test_name: ""
    });


    /*
    ==================================================
    COMMON LABORATORY INVESTIGATIONS

    These are only quick-select helpers.
    They still save into the existing test_name field.
    ==================================================
    */

    const commonTests = [
        "Full Blood Count (FBC)",
        "Malaria Parasite Test",
        "Urinalysis",
        "Blood Glucose",
        "Liver Function Test (LFT)",
        "Kidney Function Test (RFT)",
        "Widal Test",
        "HIV Screening",
        "Hepatitis B Screening"
    ];


    /*
    ==================================================
    LOAD PATIENTS & DOCTORS
    ==================================================
    */

const loadData = async () => {

        try {

            setLoadingData(true);
            setError("");

            const [
                patientData,
                doctorData
            ] = await Promise.all([
                getPatients(),
                getDoctors()
            ]);


            setPatients(
                patientData?.patients || []
            );

            setDoctors(
                doctorData?.doctors || []
            );

        } catch (err) {

            console.error(
                "❌ Failed to load laboratory form data:",
                err
            );

            setError(
                "Unable to load patients and doctors. Please try again."
            );

        } finally {

            setLoadingData(false);

        }

    };

    useEffect(() => {

        loadData();

    }, []);


    /*
    ==================================================
    LOAD EXISTING TEST
    ==================================================
    */

    useEffect(() => {

        if (laboratoryTest) {

            setFormData({
                patient_id:
                    laboratoryTest.patient_id || "",

                doctor_id:
                    laboratoryTest.doctor_id || "",

                test_name:
                    laboratoryTest.test_name || ""
            });

        } else {

            setFormData({
                patient_id: "",
                doctor_id: "",
                test_name: ""
            });

        }

        setError("");

    }, [laboratoryTest]);


    /*
    ==================================================
    LOAD DATA
    ==================================================
    */

    


    /*
    ==================================================
    HANDLE CHANGE
    ==================================================
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));


        if (error) {
            setError("");
        }

    };


    /*
    ==================================================
    QUICK TEST SELECTION
    ==================================================
    */

    const handleTestSelect = (testName) => {

        setFormData((previous) => ({
            ...previous,
            test_name: testName
        }));

        setError("");

    };


    /*
    ==================================================
    SUBMIT
    ==================================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();


        const patientId =
            String(formData.patient_id).trim();

        const doctorId =
            String(formData.doctor_id).trim();

        const testName =
            String(formData.test_name).trim();


        if (!patientId) {

            setError(
                "Please select a patient."
            );

            return;

        }


        if (!doctorId) {

            setError(
                "Please select the requesting doctor."
            );

            return;

        }


        if (!testName) {

            setError(
                "Please enter the laboratory investigation."
            );

            return;

        }


        try {

            setSubmitting(true);
            setError("");


            await onSave({

                patient_id: patientId,

                doctor_id: doctorId,

                test_name: testName

            });

        } catch (err) {

            console.error(
                "❌ Laboratory form submission failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to save laboratory test."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
    ==================================================
    SELECTED PATIENT
    ==================================================
    */

    const selectedPatient =
        patients.find(
            (patient) =>
                String(patient.patient_id) ===
                String(formData.patient_id)
        );


    /*
    ==================================================
    SELECTED DOCTOR
    ==================================================
    */

    const selectedDoctor =
        doctors.find(
            (doctor) =>
                String(doctor.doctor_id) ===
                String(formData.doctor_id)
        );


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <form
            onSubmit={handleSubmit}
            className="laboratory-form"
        >

            {/* ==================================================
                FORM TOP BAR
            ================================================== */}

            <div className="laboratory-form-top">

                <div className="laboratory-form-brand">

                    <div className="laboratory-form-icon">

                        <FlaskConical
                            size={23}
                            strokeWidth={2}
                        />

                    </div>


                    <div>

                        <div className="laboratory-form-eyebrow">

                            <span className="laboratory-live-dot"></span>

                            Laboratory Services

                        </div>


                        <h2>

                            {laboratoryTest
                                ? "Edit Laboratory Request"
                                : "New Laboratory Request"}

                        </h2>

                    </div>

                </div>


                <div className="laboratory-form-reference">

                    <span>
                        {laboratoryTest
                            ? "EDITING"
                            : "NEW REQUEST"}
                    </span>

                </div>

            </div>


            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className="laboratory-form-intro">

                <ClipboardList size={17} />

                <p>

                    {laboratoryTest
                        ? "Review and update the laboratory investigation details below."
                        : "Create a laboratory investigation request for a patient."}

                </p>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    className="laboratory-form-error"
                    role="alert"
                >

                    <div className="laboratory-error-icon">

                        <AlertCircle size={17} />

                    </div>

                    <div>

                        <strong>
                            Request could not be saved
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                </div>

            )}


            {/* ==================================================
                LOADING
            ================================================== */}

            {loadingData ? (

                <div className="laboratory-form-loading">

                    <div className="laboratory-form-spinner"></div>

                    <strong>
                        Preparing laboratory request
                    </strong>

                    <p>
                        Loading patients and doctors...
                    </p>

                </div>

            ) : (

                <>

                    {/* ==================================================
                        SECTION 1 — REQUEST DETAILS
                    ================================================== */}

                    <div className="laboratory-form-section">

                        <div className="laboratory-section-heading">

                            <div className="laboratory-section-number">
                                01
                            </div>

                            <div>

                                <h3>
                                    Request Details
                                </h3>

                                <p>
                                    Identify the patient and requesting clinician.
                                </p>

                            </div>

                        </div>


                        <div className="laboratory-form-grid">


                            {/* ==================================================
                                PATIENT
                            ================================================== */}

                            <div className="laboratory-form-group">

                                <label htmlFor="laboratory-patient">

                                    <span className="laboratory-label-icon">

                                        <UserRound size={14} />

                                    </span>

                                    Patient

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <div className="laboratory-select-wrapper">

                                    <select
                                        id="laboratory-patient"
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        required
                                    >

                                        <option value="">
                                            Select patient
                                        </option>

                                        {patients.map(
                                            (patient, index) => (

                                                <option
                                                    key={`lab-patient-${patient.patient_id ?? patient.id ?? index}`}
                                                    value={patient.patient_id}
                                                >

                                                    {patient.first_name}{" "}
                                                    {patient.last_name}

                                                </option>

                                            )
                                        )}

                                    </select>


                                    <ChevronDown
                                        size={17}
                                        className="laboratory-select-icon"
                                    />

                                </div>


                                {selectedPatient && (

                                    <div className="laboratory-selected-context">

                                        <CheckCircle2 size={14} />

                                        <span>

                                            Patient #{selectedPatient.patient_id}

                                        </span>

                                    </div>

                                )}


                                {patients.length === 0 && (

                                    <small className="laboratory-form-hint">

                                        No patients are currently available.

                                    </small>

                                )}

                            </div>


                            {/* ==================================================
                                DOCTOR
                            ================================================== */}

                            <div className="laboratory-form-group">

                                <label htmlFor="laboratory-doctor">

                                    <span className="laboratory-label-icon">

                                        <Stethoscope size={14} />

                                    </span>

                                    Requesting Doctor

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <div className="laboratory-select-wrapper">

                                    <select
                                        id="laboratory-doctor"
                                        name="doctor_id"
                                        value={formData.doctor_id}
                                        onChange={handleChange}
                                        disabled={submitting}
                                        required
                                    >

                                        <option value="">
                                            Select requesting doctor
                                        </option>

                                        {doctors.map(
                                            (doctor, index) => (

                                                <option
                                                    key={`lab-doctor-${doctor.doctor_id ?? doctor.id ?? index}`}
                                                    value={doctor.doctor_id}
                                                >

                                                    Dr.{" "}
                                                    {doctor.first_name}{" "}
                                                    {doctor.last_name}

                                                    {doctor.specialization
                                                        ? ` — ${doctor.specialization}`
                                                        : ""}

                                                </option>

                                            )
                                        )}

                                    </select>


                                    <ChevronDown
                                        size={17}
                                        className="laboratory-select-icon"
                                    />

                                </div>


                                {selectedDoctor && (

                                    <div className="laboratory-selected-context">

                                        <CheckCircle2 size={14} />

                                        <span>

                                            {selectedDoctor.specialization ||
                                                "Medical Practitioner"}

                                        </span>

                                    </div>

                                )}


                                {doctors.length === 0 && (

                                    <small className="laboratory-form-hint">

                                        No doctors are currently available.

                                    </small>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        SECTION 2 — INVESTIGATION
                    ================================================== */}

                    <div className="laboratory-form-section laboratory-investigation-section">

                        <div className="laboratory-section-heading">

                            <div className="laboratory-section-number">
                                02
                            </div>

                            <div>

                                <h3>
                                    Laboratory Investigation
                                </h3>

                                <p>
                                    Specify the investigation required by the clinician.
                                </p>

                            </div>

                        </div>


                        <div className="laboratory-investigation-card">

                            <div className="laboratory-investigation-icon">

                                <TestTube2
                                    size={22}
                                />

                            </div>


                            <div className="laboratory-investigation-content">

                                <label htmlFor="laboratory-test-name">

                                    Investigation Name

                                    <span className="required">
                                        *
                                    </span>

                                </label>


                                <input
                                    id="laboratory-test-name"
                                    type="text"
                                    name="test_name"
                                    placeholder="e.g. Full Blood Count (FBC)"
                                    value={formData.test_name}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    maxLength={150}
                                    autoComplete="off"
                                    required
                                />


                                <div className="laboratory-character-count">

                                    {formData.test_name.length}/150

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            COMMON TESTS
                        ================================================== */}

                        <div className="laboratory-common-tests">

                            <div className="laboratory-common-tests-title">

                                Common investigations

                            </div>


                            <div className="laboratory-test-chips">

                                {commonTests.map(
                                    (test, index) => (

                                        <button
                                            key={`lab-common-test-${test}-${index}`}
                                            type="button"
                                            className={
                                                `laboratory-test-chip ${
                                                    formData.test_name === test
                                                        ? "active"
                                                        : ""
                                                }`
                                            }
                                            onClick={() =>
                                                handleTestSelect(test)
                                            }
                                            disabled={submitting}
                                        >

                                            {formData.test_name === test && (
                                                <CheckCircle2 size={13} />
                                            )}

                                            {test}

                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        FORM FOOTER
                    ================================================== */}

                    <div className="laboratory-form-actions">

                        <div className="laboratory-required-note">

                            <span>*</span>

                            Required fields

                        </div>


                        <div className="laboratory-form-buttons">

                            <button
                                type="button"
                                className="laboratory-cancel-btn"
                                onClick={onCancel}
                                disabled={submitting}
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                className="laboratory-save-btn"
                                disabled={
                                    submitting ||
                                    !patients.length ||
                                    !doctors.length
                                }
                            >

                                {submitting ? (

                                    <>

                                        <span className="laboratory-button-spinner"></span>

                                        {laboratoryTest
                                            ? "Updating..."
                                            : "Submitting..."}

                                    </>

                                ) : (

                                    <>

                                        <FlaskConical size={16} />

                                        {laboratoryTest
                                            ? "Update Request"
                                            : "Submit Laboratory Request"}

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </>

            )}

        </form>

    );

}


export default AddLaboratoryForm;