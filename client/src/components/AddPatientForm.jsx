
import { useEffect, useMemo, useState } from "react";

import {
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    MapPin,
    Globe2,
    HeartPulse,
    Droplets,
    ShieldAlert,
    BriefcaseMedical,
    UsersRound,
    FileText,
    IdCard,
    Save,
    X,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";

import "./AddPatientForm.css";


/*
==================================================
HOSPITAL MANAGEMENT SYSTEM
ADD / EDIT PATIENT FORM
==================================================
*/


function AddPatientForm({
    patient,
    onSave,
    onCancel,
}) {

    /*
    ==================================================
    EMPTY FORM
    ==================================================
    */

    const emptyForm = {
        first_name: "",
        last_name: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        nationality: "",
        state_of_origin: "",
        lga: "",
        date_of_birth: "",
        blood_group: "",
        genotype: "",
        marital_status: "",
        occupation: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        allergies: "",
        medical_history: "",
    };


    /*
    ==================================================
    NIGERIAN STATES
    ==================================================
    */

    const nigerianStates = [
        "Abia",
        "Adamawa",
        "Akwa Ibom",
        "Anambra",
        "Bauchi",
        "Bayelsa",
        "Benue",
        "Borno",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Ekiti",
        "Enugu",
        "Gombe",
        "Imo",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Lagos",
        "Nasarawa",
        "Niger",
        "Ogun",
        "Ondo",
        "Osun",
        "Oyo",
        "Plateau",
        "Rivers",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
        "Federal Capital Territory",
    ];


    /*
    ==================================================
    STATE
    ==================================================
    */

    const [formData, setFormData] = useState(emptyForm);

    const [errors, setErrors] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);


    /*
    ==================================================
    LOAD PATIENT INTO FORM
    ==================================================
    */

    useEffect(() => {

        if (patient) {

            setFormData({

                first_name:
                    patient.first_name || "",

                last_name:
                    patient.last_name || "",

                gender:
                    patient.gender || "",

                email:
                    patient.email || "",

                phone:
                    patient.phone || "",

                address:
                    patient.address || "",

                nationality:
                    patient.nationality || "",

                state_of_origin:
                    patient.state_of_origin ||
                    patient.state ||
                    "",

                lga:
                    patient.lga || "",

                date_of_birth:
                    patient.date_of_birth
                        ? patient.date_of_birth
                            .split("T")[0]
                        : "",

                blood_group:
                    patient.blood_group || "",

                genotype:
                    patient.genotype || "",

                marital_status:
                    patient.marital_status || "",

                occupation:
                    patient.occupation || "",

                emergency_contact_name:
                    patient.emergency_contact_name || "",

                emergency_contact_phone:
                    patient.emergency_contact_phone || "",

                emergency_contact_relationship:
                    patient.emergency_contact_relationship || "",

                allergies:
                    patient.allergies || "",

                medical_history:
                    patient.medical_history || "",
            });

        } else {

            setFormData(emptyForm);

        }

        setErrors({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patient]);


    /*
    ==================================================
    EDIT MODE
    ==================================================
    */

    const isEditMode = Boolean(patient);


    /*
    ==================================================
    SAFE FIELD VALUE
    ==================================================
    */

    const getValue = (name) => {

        return formData[name] ?? "";

    };


    /*
    ==================================================
    HANDLE CHANGE
    ==================================================
    */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({

            ...previous,

            [name]: value,

        }));


        if (errors[name]) {

            setErrors((previous) => {

                const updated = {
                    ...previous,
                };

                delete updated[name];

                return updated;

            });

        }

    };


    /*
    ==================================================
    VALIDATION
    ==================================================
    */

    const validateForm = () => {

        const nextErrors = {};


        if (!formData.first_name.trim()) {

            nextErrors.first_name =
                "First name is required.";

        }


        if (!formData.last_name.trim()) {

            nextErrors.last_name =
                "Last name is required.";

        }


        if (!formData.gender) {

            nextErrors.gender =
                "Please select the patient's gender.";

        }


        if (!formData.email.trim()) {

            nextErrors.email =
                "Email address is required.";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email
            )
        ) {

            nextErrors.email =
                "Enter a valid email address.";

        }


        if (!formData.phone.trim()) {

            nextErrors.phone =
                "Phone number is required.";

        }


        if (!formData.date_of_birth) {

            nextErrors.date_of_birth =
                "Date of birth is required.";

        }


        if (!formData.address.trim()) {

            nextErrors.address =
                "Residential address is required.";

        }


        return nextErrors;

    };


    /*
    ==================================================
    SUBMIT
    ==================================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();


        const validationErrors =
            validateForm();


        if (Object.keys(validationErrors).length > 0) {

            setErrors(validationErrors);

            return;

        }


        try {

            setIsSubmitting(true);


            await onSave(formData);

        } catch (error) {

            console.error(
                "Patient form submission failed:",
                error
            );

        } finally {

            setIsSubmitting(false);

        }

    };


    /*
    ==================================================
    CANCEL
    ==================================================
    */

    const handleCancel = () => {

        if (isSubmitting) {
            return;
        }

        onCancel();

    };


    /*
    ==================================================
    CHARACTER COUNTS
    ==================================================
    */

    const allergiesCount =
        formData.allergies.length;


    const historyCount =
        formData.medical_history.length;


    /*
    ==================================================
    COMPLETION STATUS
    ==================================================
    */

    const requiredFields = [
        formData.first_name,
        formData.last_name,
        formData.gender,
        formData.email,
        formData.phone,
        formData.date_of_birth,
        formData.address,
    ];


    const completedRequiredFields =
        requiredFields.filter(
            (field) =>
                String(field).trim() !== ""
        ).length;


    const completionPercentage =
        useMemo(() => {

            return Math.round(
                (
                    completedRequiredFields /
                    requiredFields.length
                ) * 100
            );

        }, [
            completedRequiredFields,
            requiredFields.length,
        ]);


    /*
    ==================================================
    FIELD ERROR HELPER
    ==================================================
    */

    const fieldClass = (name) => {

        return errors[name]
            ? "patient-form-field has-error"
            : "patient-form-field";

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <form
            className="add-patient-form"
            onSubmit={handleSubmit}
            noValidate
        >


            {/* ==================================================
                FORM INTRO
            ================================================== */}

            <div className="patient-form-intro">

                <div className="patient-form-intro-icon">

                    {isEditMode
                        ? <IdCard size={20} />
                        : <UserRound size={20} />
                    }

                </div>


                <div className="patient-form-intro-content">

                    <span>
                        {isEditMode
                            ? "Patient Record Management"
                            : "New Patient Registration"}
                    </span>

                    <h2>
                        {isEditMode
                            ? "Update Patient Record"
                            : "Register a New Patient"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Review and update the patient's hospital information below."
                            : "Create a complete patient record for hospital care and future visits."}
                    </p>

                </div>


                <div className="patient-form-completion">

                    <div className="patient-form-completion-top">

                        <span>
                            Required information
                        </span>

                        <strong>
                            {completionPercentage}%
                        </strong>

                    </div>


                    <div className="patient-form-progress">

                        <span
                            style={{
                                width: `${completionPercentage}%`,
                            }}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                HOSPITAL IDENTIFICATION
            ================================================== */}

            {isEditMode && (

                <section className="patient-form-section">

                    <div className="patient-form-section-title">

                        <div className="patient-form-section-title-icon">

                            <IdCard size={16} />

                        </div>


                        <div>

                            <h3>
                                Hospital Identification
                            </h3>

                            <p>
                                Existing record identification
                            </p>

                        </div>

                    </div>


                    <div className="patient-form-grid">

                        <div className="patient-form-field">

                            <label>
                                Medical Record Number
                            </label>

                            <div className="patient-form-input-wrap">

                                <IdCard size={15} />

                                <input
                                    type="text"
                                    value={
                                        patient.mrn ||
                                        patient.medical_record_number ||
                                        patient.patient_number ||
                                        "Not assigned"
                                    }
                                    disabled
                                />

                            </div>

                            <small className="patient-form-help">
                                Automatically assigned by the hospital system.
                            </small>

                        </div>


                        <div className="patient-form-field">

                            <label>
                                Patient Number
                            </label>

                            <div className="patient-form-input-wrap">

                                <IdCard size={15} />

                                <input
                                    type="text"
                                    value={
                                        patient.patient_number ||
                                        "Not assigned"
                                    }
                                    disabled
                                />

                            </div>

                            <small className="patient-form-help">
                                Unique hospital patient identifier.
                            </small>

                        </div>

                    </div>

                </section>

            )}


            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="patient-form-section">

                <div className="patient-form-section-title">

                    <div className="patient-form-section-title-icon">

                        <UserRound size={16} />

                    </div>


                    <div>

                        <h3>
                            Personal Information
                        </h3>

                        <p>
                            Basic identity and demographic information
                        </p>

                    </div>

                </div>


                <div className="patient-form-grid">


                    {/* FIRST NAME */}

                    <div className={fieldClass("first_name")}>

                        <label htmlFor="first_name">

                            First Name

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap">

                            <UserRound size={15} />

                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                placeholder="Enter first name"
                                value={getValue("first_name")}
                                onChange={handleChange}
                                autoComplete="given-name"
                            />

                        </div>


                        {errors.first_name && (
                            <small className="patient-form-error">
                                {errors.first_name}
                            </small>
                        )}

                    </div>


                    {/* LAST NAME */}

                    <div className={fieldClass("last_name")}>

                        <label htmlFor="last_name">

                            Last Name

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap">

                            <UserRound size={15} />

                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                placeholder="Enter last name"
                                value={getValue("last_name")}
                                onChange={handleChange}
                                autoComplete="family-name"
                            />

                        </div>


                        {errors.last_name && (
                            <small className="patient-form-error">
                                {errors.last_name}
                            </small>
                        )}

                    </div>


                    {/* GENDER */}

                    <div className={fieldClass("gender")}>

                        <label htmlFor="gender">

                            Gender

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <UsersRound size={15} />

                            <select
                                id="gender"
                                name="gender"
                                value={getValue("gender")}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {errors.gender && (
                            <small className="patient-form-error">
                                {errors.gender}
                            </small>
                        )}

                    </div>


                    {/* DATE OF BIRTH */}

                    <div className={fieldClass("date_of_birth")}>

                        <label htmlFor="date_of_birth">

                            Date of Birth

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap">

                            <CalendarDays size={15} />

                            <input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={getValue("date_of_birth")}
                                onChange={handleChange}
                                max={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                            />

                        </div>


                        {errors.date_of_birth && (
                            <small className="patient-form-error">
                                {errors.date_of_birth}
                            </small>
                        )}

                    </div>


                    {/* EMAIL */}

                    <div className={fieldClass("email")}>

                        <label htmlFor="email">

                            Email Address

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap">

                            <Mail size={15} />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="patient@example.com"
                                value={getValue("email")}
                                onChange={handleChange}
                                autoComplete="email"
                            />

                        </div>


                        {errors.email && (
                            <small className="patient-form-error">
                                {errors.email}
                            </small>
                        )}

                    </div>


                    {/* PHONE */}

                    <div className={fieldClass("phone")}>

                        <label htmlFor="phone">

                            Phone Number

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap">

                            <Phone size={15} />

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="e.g. 0803 123 4567"
                                value={getValue("phone")}
                                onChange={handleChange}
                                autoComplete="tel"
                            />

                        </div>


                        {errors.phone && (
                            <small className="patient-form-error">
                                {errors.phone}
                            </small>
                        )}

                    </div>


                    {/* MARITAL STATUS */}

                    <div className={fieldClass("marital_status")}>

                        <label htmlFor="marital_status">
                            Marital Status
                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <UsersRound size={15} />

                            <select
                                id="marital_status"
                                name="marital_status"
                                value={getValue("marital_status")}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select marital status
                                </option>

                                <option value="Single">
                                    Single
                                </option>

                                <option value="Married">
                                    Married
                                </option>

                                <option value="Divorced">
                                    Divorced
                                </option>

                                <option value="Widowed">
                                    Widowed
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* OCCUPATION */}

                    <div className={fieldClass("occupation")}>

                        <label htmlFor="occupation">
                            Occupation
                        </label>


                        <div className="patient-form-input-wrap">

                            <BriefcaseMedical size={15} />

                            <input
                                id="occupation"
                                name="occupation"
                                type="text"
                                placeholder="e.g. Teacher, Engineer, Student"
                                value={getValue("occupation")}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                NATIONALITY & LOCATION
            ================================================== */}

            <section className="patient-form-section">

                <div className="patient-form-section-title">

                    <div className="patient-form-section-title-icon">

                        <MapPin size={16} />

                    </div>


                    <div>

                        <h3>
                            Nationality & Location
                        </h3>

                        <p>
                            Residence and Nigerian demographic information
                        </p>

                    </div>

                </div>


                <div className="patient-form-grid">


                    {/* NATIONALITY */}

                    <div className={fieldClass("nationality")}>

                        <label htmlFor="nationality">
                            Nationality
                        </label>


                        <div className="patient-form-input-wrap">

                            <Globe2 size={15} />

                            <input
                                id="nationality"
                                name="nationality"
                                type="text"
                                placeholder="e.g. Nigerian"
                                value={getValue("nationality")}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* STATE */}

                    <div className={fieldClass("state_of_origin")}>

                        <label htmlFor="state_of_origin">
                            State of Origin
                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <MapPin size={15} />

                            <select
                                id="state_of_origin"
                                name="state_of_origin"
                                value={getValue("state_of_origin")}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select state
                                </option>

                                {nigerianStates.map(
                                    (state, index) => (

                                        <option
                                            key={`patient-state-${state}-${index}`}
                                            value={state}
                                        >
                                            {state}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* LGA */}

                    <div className={fieldClass("lga")}>

                        <label htmlFor="lga">
                            Local Government Area
                        </label>


                        <div className="patient-form-input-wrap">

                            <MapPin size={15} />

                            <input
                                id="lga"
                                name="lga"
                                type="text"
                                placeholder="Enter LGA"
                                value={getValue("lga")}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div
                        className={`${fieldClass("address")} patient-form-field-full`}
                    >

                        <label htmlFor="address">

                            Residential Address

                            <span className="patient-form-required">
                                *
                            </span>

                        </label>


                        <div className="patient-form-input-wrap textarea-wrap">

                            <MapPin size={15} />

                            <textarea
                                id="address"
                                name="address"
                                placeholder="Enter patient's residential address"
                                value={getValue("address")}
                                onChange={handleChange}
                                rows="3"
                            />

                        </div>


                        {errors.address && (
                            <small className="patient-form-error">
                                {errors.address}
                            </small>
                        )}

                    </div>

                </div>

            </section>


            {/* ==================================================
                MEDICAL INFORMATION
            ================================================== */}

            <section className="patient-form-section medical-form-section">

                <div className="patient-form-section-title">

                    <div className="patient-form-section-title-icon medical">

                        <HeartPulse size={16} />

                    </div>


                    <div>

                        <h3>
                            Medical Information
                        </h3>

                        <p>
                            Clinical information important for patient care
                        </p>

                    </div>

                </div>


                <div className="patient-form-clinical-note">

                    <HeartPulse size={15} />

                    <span>
                        Enter clinically relevant information carefully.
                        This information may be used by authorised healthcare professionals.
                    </span>

                </div>


                <div className="patient-form-grid">


                    {/* BLOOD GROUP */}

                    <div className={fieldClass("blood_group")}>

                        <label htmlFor="blood_group">
                            Blood Group
                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <Droplets size={15} />

                            <select
                                id="blood_group"
                                name="blood_group"
                                value={getValue("blood_group")}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select blood group
                                </option>

                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>

                            </select>

                        </div>

                    </div>


                    {/* GENOTYPE */}

                    <div className={fieldClass("genotype")}>

                        <label htmlFor="genotype">
                            Genotype
                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <HeartPulse size={15} />

                            <select
                                id="genotype"
                                name="genotype"
                                value={getValue("genotype")}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select genotype
                                </option>

                                <option value="AA">AA</option>
                                <option value="AS">AS</option>
                                <option value="AC">AC</option>
                                <option value="SS">SS</option>
                                <option value="SC">SC</option>

                            </select>

                        </div>

                    </div>


                    {/* ALLERGIES */}

                    <div
                        className="patient-form-field patient-form-field-full"
                    >

                        <div className="patient-form-label-row">

                            <label htmlFor="allergies">
                                Allergies
                            </label>

                            <span>
                                {allergiesCount}/500
                            </span>

                        </div>


                        <div className="patient-form-input-wrap textarea-wrap">

                            <ShieldAlert size={15} />

                            <textarea
                                id="allergies"
                                name="allergies"
                                placeholder="Record known drug, food or environmental allergies. Enter 'No known allergies' if confirmed."
                                value={getValue("allergies")}
                                onChange={handleChange}
                                maxLength={500}
                                rows="3"
                            />

                        </div>


                        <small className="patient-form-help">
                            Important: verify allergy information whenever possible.
                        </small>

                    </div>


                    {/* MEDICAL HISTORY */}

                    <div
                        className="patient-form-field patient-form-field-full"
                    >

                        <div className="patient-form-label-row">

                            <label htmlFor="medical_history">
                                Medical History
                            </label>

                            <span>
                                {historyCount}/2000
                            </span>

                        </div>


                        <div className="patient-form-input-wrap textarea-wrap">

                            <FileText size={15} />

                            <textarea
                                id="medical_history"
                                name="medical_history"
                                placeholder="Record relevant previous illnesses, surgeries, chronic conditions, hospitalisations or other clinical history."
                                value={getValue("medical_history")}
                                onChange={handleChange}
                                maxLength={2000}
                                rows="5"
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                EMERGENCY CONTACT
            ================================================== */}

            <section className="patient-form-section emergency-form-section">

                <div className="patient-form-section-title">

                    <div className="patient-form-section-title-icon emergency">

                        <ShieldAlert size={16} />

                    </div>


                    <div>

                        <h3>
                            Emergency Contact
                        </h3>

                        <p>
                            Person to contact when urgent communication is required
                        </p>

                    </div>

                </div>


                <div className="patient-form-emergency-banner">

                    <ShieldAlert size={16} />

                    <div>

                        <strong>
                            Emergency contact information
                        </strong>

                        <span>
                            Use a trusted person who can be reached quickly when necessary.
                        </span>

                    </div>

                </div>


                <div className="patient-form-grid">


                    {/* CONTACT NAME */}

                    <div className={fieldClass("emergency_contact_name")}>

                        <label htmlFor="emergency_contact_name">
                            Contact Name
                        </label>


                        <div className="patient-form-input-wrap">

                            <UserRound size={15} />

                            <input
                                id="emergency_contact_name"
                                name="emergency_contact_name"
                                type="text"
                                placeholder="Full name"
                                value={getValue("emergency_contact_name")}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* RELATIONSHIP */}

                    <div
                        className={fieldClass(
                            "emergency_contact_relationship"
                        )}
                    >

                        <label htmlFor="emergency_contact_relationship">
                            Relationship
                        </label>


                        <div className="patient-form-input-wrap select-wrap">

                            <UsersRound size={15} />

                            <select
                                id="emergency_contact_relationship"
                                name="emergency_contact_relationship"
                                value={getValue(
                                    "emergency_contact_relationship"
                                )}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select relationship
                                </option>

                                <option value="Parent">
                                    Parent
                                </option>

                                <option value="Spouse">
                                    Spouse
                                </option>

                                <option value="Sibling">
                                    Sibling
                                </option>

                                <option value="Child">
                                    Child
                                </option>

                                <option value="Relative">
                                    Relative
                                </option>

                                <option value="Friend">
                                    Friend
                                </option>

                                <option value="Guardian">
                                    Guardian
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* CONTACT PHONE */}

                    <div
                        className={`${fieldClass(
                            "emergency_contact_phone"
                        )} patient-form-field-full`}
                    >

                        <label htmlFor="emergency_contact_phone">
                            Emergency Contact Phone
                        </label>


                        <div className="patient-form-input-wrap">

                            <Phone size={15} />

                            <input
                                id="emergency_contact_phone"
                                name="emergency_contact_phone"
                                type="tel"
                                placeholder="e.g. 0803 123 4567"
                                value={getValue(
                                    "emergency_contact_phone"
                                )}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FORM FOOTER
            ================================================== */}

            <div className="patient-form-actions">


                <div className="patient-form-actions-note">

                    <CheckCircle2 size={15} />

                    <span>
                        {isEditMode
                            ? "Changes will update the existing patient record."
                            : "Please review the information before registering the patient."}
                    </span>

                </div>


                <div className="patient-form-actions-buttons">

                    <button
                        type="button"
                        className="patient-form-button cancel"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >

                        <X size={15} />

                        Cancel

                    </button>


                    <button
                        type="submit"
                        className="patient-form-button save"
                        disabled={isSubmitting}
                    >

                        {isSubmitting ? (

                            <>
                                <LoaderCircle
                                    size={15}
                                    className="patient-form-spinner"
                                />

                                {isEditMode
                                    ? "Updating..."
                                    : "Registering..."}
                            </>

                        ) : (

                            <>
                                <Save size={15} />

                                {isEditMode
                                    ? "Update Patient"
                                    : "Register Patient"}
                            </>

                        )}

                    </button>

                </div>

            </div>

        </form>

    );

}


export default AddPatientForm;

