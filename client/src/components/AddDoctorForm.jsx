
import { useEffect, useState } from "react";

import {
    UserRound,
    Stethoscope,
    Mail,
    Phone,
    BriefcaseMedical,
    Clock3,
    X,
    Save,
    MapPin,
    BadgeCheck,
    CalendarDays,
    Building2,
    ShieldCheck
} from "lucide-react";

import "./AddDoctorForm.css";

import {
    getActiveDepartments
} from "../services/departmentService";

/*
==================================================
HOSPITAL MANAGEMENT SYSTEM — ADD / EDIT DOCTOR FORM
==================================================

Supports:

Personal Information
Professional Information
Medical Registration
Employment Information

Compatible with:

createDoctor()
updateDoctor()

==================================================
*/


function AddDoctorForm({
    doctor,
    onSave,
    onCancel
}) {


    /*
    ==================================================
    FORM STATE
    ==================================================
    */

    const [formData, setFormData] = useState({

        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",

        specialization: "",
        specialization_id: "",
        department_id: "",

        phone: "",
        email: "",
        address: "",

        years_of_experience: "",

        mdcn_number: "",
        mdcn_status: "",
        license_expiry_date: "",

        employment_type: "",
        employment_start_date: "",
        employment_end_date: "",
        employment_status: ""

    });


    /*
    ==================================================
    LOAD DOCTOR FOR EDITING
    ==================================================
    */
    const [
        departments,
        setDepartments
    ] = useState([]);

    const [
        loadingDepartments,
        setLoadingDepartments
    ] = useState(false);
    const resetForm = () => {

        setFormData({

            first_name: "",
            middle_name: "",
            last_name: "",
            gender: "",

            specialization: "",
            specialization_id: "",
            department_id: "",

            phone: "",
            email: "",
            address: "",

            years_of_experience: "",

            mdcn_number: "",
            mdcn_status: "",
            license_expiry_date: "",

            employment_type: "",
            employment_start_date: "",
            employment_end_date: "",
            employment_status: ""

        });

    };

    useEffect(() => {

        if (doctor) {

            setFormData({

                first_name:
                    doctor.first_name || "",

                middle_name:
                    doctor.middle_name || "",

                last_name:
                    doctor.last_name || "",

                gender:
                    doctor.gender || "",


                specialization:
                    doctor.specialization || "",

                specialization_id:
                    doctor.specialization_id ?? "",

                department_id:
                    doctor.department_id ?? "",


                phone:
                    doctor.phone || "",

                email:
                    doctor.email || "",

                address:
                    doctor.address || "",


                years_of_experience:
                    doctor.years_of_experience ?? "",


                mdcn_number:
                    doctor.mdcn_number || "",

                mdcn_status:
                    doctor.mdcn_status || "",

                license_expiry_date:
                    doctor.license_expiry_date
                        ? String(
                            doctor.license_expiry_date
                        ).slice(0, 10)
                        : "",


                employment_type:
                    doctor.employment_type || "",

                employment_start_date:
                    doctor.employment_start_date
                        ? String(
                            doctor.employment_start_date
                        ).slice(0, 10)
                        : "",

                employment_end_date:
                    doctor.employment_end_date
                        ? String(
                            doctor.employment_end_date
                        ).slice(0, 10)
                        : "",

                employment_status:
                    doctor.employment_status || ""

            });

        } else {

            resetForm();

        }

    }, [doctor]);


    /*
    ==================================================
    RESET FORM
    ==================================================
    */


    useEffect(() => {

        const loadDepartments = async () => {

            try {

                setLoadingDepartments(true);

                const response =
                    await getActiveDepartments();

                if (
                    response?.success &&
                    Array.isArray(
                        response.departments
                    )
                ) {

                    setDepartments(
                        response.departments
                    );

                } else {

                    setDepartments([]);

                }

            } catch (error) {

                console.error(
                    "Failed to load departments:",
                    error
                );

                setDepartments([]);

            } finally {

                setLoadingDepartments(false);

            }

        };

        loadDepartments();

    }, []);

    /*
    ==================================================
    HANDLE INPUT
    ==================================================
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    /*
    ==================================================
    SUBMIT
    ==================================================
    */

    const handleSubmit = (e) => {

        e.preventDefault();


        /*
        ----------------------------------------------
        CLEAN PAYLOAD
        ----------------------------------------------
        */

        const payload = {

            ...formData,

            specialization_id:
                formData.specialization_id
                    ? Number(
                        formData.specialization_id
                    )
                    : undefined,

            department_id:
                formData.department_id
                    ? Number(
                        formData.department_id
                    )
                    : undefined,

            years_of_experience:
                formData.years_of_experience !== ""
                    ? Number(
                        formData.years_of_experience
                    )
                    : undefined

        };


        /*
        ----------------------------------------------
        REMOVE EMPTY OPTIONAL VALUES
        ----------------------------------------------
        */

        Object.keys(payload).forEach(
            key => {

                if (
                    payload[key] === ""
                    ||
                    payload[key] === undefined
                ) {

                    delete payload[key];

                }

            }
        );


        onSave(payload);

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="doctor-form-overlay">

            <div className="doctor-form-card">


                {/* ======================================
                    FORM HEADER
                ====================================== */}

                <div className="doctor-form-header">

                    <div className="doctor-form-title">

                        <div className="doctor-form-icon">

                            <Stethoscope size={24} />

                        </div>


                        <div>

                            <h2>

                                {
                                    doctor
                                        ? "Edit Doctor"
                                        : "Add New Doctor"
                                }

                            </h2>


                            <p>

                                {
                                    doctor
                                        ? "Update the doctor's information and professional records."
                                        : "Create a complete professional profile for a medical staff member."
                                }

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="doctor-form-close"
                        onClick={onCancel}
                        aria-label="Close form"
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* ======================================
                    FORM
                ====================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="doctor-form"
                >


                    {/* ==================================
                        PERSONAL INFORMATION
                    ================================== */}

                    <div className="doctor-form-section">

                        <div className="doctor-section-heading">

                            <UserRound size={18} />

                            <div>

                                <h3>
                                    Personal Information
                                </h3>

                                <p>
                                    Basic information about the doctor.
                                </p>

                            </div>

                        </div>


                        <div className="doctor-form-grid">


                            {/* FIRST NAME */}

                            <div className="doctor-field">

                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <div className="doctor-input-wrapper">

                                    <UserRound size={17} />

                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        placeholder="Enter first name"
                                        value={
                                            formData.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="100"
                                        required
                                    />

                                </div>

                            </div>


                            {/* MIDDLE NAME */}

                            <div className="doctor-field">

                                <label htmlFor="middle_name">
                                    Middle Name
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <UserRound size={17} />

                                    <input
                                        id="middle_name"
                                        name="middle_name"
                                        type="text"
                                        placeholder="Enter middle name"
                                        value={
                                            formData.middle_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="100"
                                    />

                                </div>

                            </div>


                            {/* LAST NAME */}

                            <div className="doctor-field">

                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <div className="doctor-input-wrapper">

                                    <UserRound size={17} />

                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        placeholder="Enter last name"
                                        value={
                                            formData.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="100"
                                        required
                                    />

                                </div>

                            </div>


                            {/* GENDER */}

                            <div className="doctor-field">

                                <label htmlFor="gender">
                                    Gender
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <UserRound size={17} />

                                    <select
                                        id="gender"
                                        name="gender"
                                        value={
                                            formData.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
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

                            </div>


                            {/* PHONE */}

                            <div className="doctor-field">

                                <label htmlFor="phone">
                                    Phone Number
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Phone size={17} />

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="e.g. 08012345678"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="20"
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="doctor-field">

                                <label htmlFor="email">
                                    Email Address
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Mail size={17} />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="doctor@example.com"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div className="doctor-field doctor-field-full">

                                <label htmlFor="address">
                                    Address
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper doctor-textarea-wrapper">

                                    <MapPin size={17} />

                                    <textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter residential or contact address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="500"
                                        rows="3"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        PROFESSIONAL INFORMATION
                    ================================== */}

                    <div className="doctor-form-section">

                        <div className="doctor-section-heading">

                            <BriefcaseMedical size={18} />

                            <div>

                                <h3>
                                    Professional Information
                                </h3>

                                <p>
                                    Medical specialization, department and experience.
                                </p>

                            </div>

                        </div>


                        <div className="doctor-form-grid">


                            {/* SPECIALIZATION */}

                            <div className="doctor-field">

                                <label htmlFor="specialization">
                                    Specialization
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Stethoscope size={17} />

                                    <input
                                        id="specialization"
                                        name="specialization"
                                        type="text"
                                        placeholder="e.g. Cardiology"
                                        value={
                                            formData.specialization
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="100"
                                        required
                                    />

                                </div>

                            </div>


                            {/* SPECIALIZATION ID */}

                            <div className="doctor-field">

                                <label htmlFor="specialization_id">
                                    Specialization ID
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Stethoscope size={17} />

                                    <input
                                        id="specialization_id"
                                        name="specialization_id"
                                        type="number"
                                        min="1"
                                        placeholder="Linked specialization ID"
                                        value={
                                            formData.specialization_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* DEPARTMENT ID */}

                            {/* DEPARTMENT */}

                            <div className="doctor-field">

                                <label htmlFor="department_id">
                                    Department
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Building2 size={17} />

                                    <select
                                        id="department_id"
                                        name="department_id"
                                        value={
                                            formData.department_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loadingDepartments}
                                    >

                                        <option value="">

                                            {
                                                loadingDepartments
                                                    ? "Loading departments..."
                                                    : "Select department"
                                            }

                                        </option>

                                        {
                                            departments.map(
                                                department => (

                                                    <option
                                                        key={
                                                            department.department_id
                                                        }
                                                        value={
                                                            department.department_id
                                                        }
                                                    >

                                                        {
                                                            department.department_name
                                                        }

                                                        {
                                                            department.department_code
                                                                ? ` (${department.department_code})`
                                                                : ""
                                                        }

                                                    </option>

                                                )
                                            )
                                        }

                                    </select>

                                </div>

                            </div>


                            {/* YEARS EXPERIENCE */}

                            <div className="doctor-field">

                                <label htmlFor="years_of_experience">
                                    Years of Experience
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <Clock3 size={17} />

                                    <input
                                        id="years_of_experience"
                                        name="years_of_experience"
                                        type="number"
                                        placeholder="e.g. 5"
                                        value={
                                            formData.years_of_experience
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        max="80"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        MEDICAL REGISTRATION
                    ================================== */}

                    <div className="doctor-form-section">

                        <div className="doctor-section-heading">

                            <ShieldCheck size={18} />

                            <div>

                                <h3>
                                    Medical Registration & Licensing
                                </h3>

                                <p>
                                    Professional registration and medical license information.
                                </p>

                            </div>

                        </div>


                        <div className="doctor-form-grid">


                            {/* MDCN NUMBER */}

                            <div className="doctor-field">

                                <label htmlFor="mdcn_number">
                                    MDCN Number
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <BadgeCheck size={17} />

                                    <input
                                        id="mdcn_number"
                                        name="mdcn_number"
                                        type="text"
                                        placeholder="Enter MDCN number"
                                        value={
                                            formData.mdcn_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="100"
                                    />

                                </div>

                            </div>


                            {/* MDCN STATUS */}

                            <div className="doctor-field">

                                <label htmlFor="mdcn_status">
                                    MDCN Status
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <ShieldCheck size={17} />

                                    <select
                                        id="mdcn_status"
                                        name="mdcn_status"
                                        value={
                                            formData.mdcn_status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select status
                                        </option>

                                        <option value="Pending Verification">
                                            Pending Verification
                                        </option>

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Expired">
                                            Expired
                                        </option>

                                        <option value="Suspended">
                                            Suspended
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* LICENSE EXPIRY */}

                            <div className="doctor-field">

                                <label htmlFor="license_expiry_date">
                                    License Expiry Date
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <CalendarDays size={17} />

                                    <input
                                        id="license_expiry_date"
                                        name="license_expiry_date"
                                        type="date"
                                        value={
                                            formData.license_expiry_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        EMPLOYMENT INFORMATION
                    ================================== */}

                    <div className="doctor-form-section">

                        <div className="doctor-section-heading">

                            <BriefcaseMedical size={18} />

                            <div>

                                <h3>
                                    Employment Information
                                </h3>

                                <p>
                                    Employment arrangement and current staff status.
                                </p>

                            </div>

                        </div>


                        <div className="doctor-form-grid">


                            {/* EMPLOYMENT TYPE */}

                            <div className="doctor-field">

                                <label htmlFor="employment_type">
                                    Employment Type
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <BriefcaseMedical size={17} />

                                    <select
                                        id="employment_type"
                                        name="employment_type"
                                        value={
                                            formData.employment_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select employment type
                                        </option>

                                        <option value="Full-time">
                                            Full-time
                                        </option>

                                        <option value="Part-time">
                                            Part-time
                                        </option>

                                        <option value="Contract">
                                            Contract
                                        </option>

                                        <option value="Locum">
                                            Locum
                                        </option>

                                        <option value="Consultant">
                                            Consultant
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* EMPLOYMENT STATUS */}

                            <div className="doctor-field">

                                <label htmlFor="employment_status">
                                    Employment Status
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <BadgeCheck size={17} />

                                    <select
                                        id="employment_status"
                                        name="employment_status"
                                        value={
                                            formData.employment_status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select employment status
                                        </option>

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="On Leave">
                                            On Leave
                                        </option>

                                        <option value="Suspended">
                                            Suspended
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                        <option value="Resigned">
                                            Resigned
                                        </option>

                                        <option value="Terminated">
                                            Terminated
                                        </option>

                                        <option value="Retired">
                                            Retired
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* START DATE */}

                            <div className="doctor-field">

                                <label htmlFor="employment_start_date">
                                    Employment Start Date
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <CalendarDays size={17} />

                                    <input
                                        id="employment_start_date"
                                        name="employment_start_date"
                                        type="date"
                                        value={
                                            formData.employment_start_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* END DATE */}

                            <div className="doctor-field">

                                <label htmlFor="employment_end_date">
                                    Employment End Date
                                    <span className="doctor-optional">
                                        Optional
                                    </span>
                                </label>

                                <div className="doctor-input-wrapper">

                                    <CalendarDays size={17} />

                                    <input
                                        id="employment_end_date"
                                        name="employment_end_date"
                                        type="date"
                                        value={
                                            formData.employment_end_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        FORM ACTIONS
                    ================================== */}

                    <div className="doctor-form-actions">

                        <button
                            type="button"
                            className="doctor-cancel-btn"
                            onClick={onCancel}
                        >

                            <X size={17} />

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="doctor-save-btn"
                        >

                            <Save size={17} />

                            {
                                doctor
                                    ? "Update Doctor"
                                    : "Save Doctor"
                            }

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

}


export default AddDoctorForm;

