
import { useEffect, useState } from "react";

import {
    Pill,
    Package,
    Tag,
    Banknote,
    CalendarDays,
    Building2,
    AlertCircle
} from "lucide-react";

import "./AddMedicineForm.css";


function AddMedicineForm({
    medicine,
    onSave,
    onCancel
}) {

    const [formData, setFormData] = useState({
        medicine_name: "",
        category: "",
        quantity: "",
        unit_price: "",
        expiry_date: "",
        manufacturer: ""
    });

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");


    /*
    ==================================================
    LOAD MEDICINE WHEN EDITING
    ==================================================
    */

    useEffect(() => {

        if (medicine) {

            setFormData({

                medicine_name:
                    medicine.medicine_name || "",

                category:
                    medicine.category || "",

                quantity:
                    medicine.quantity ?? "",

                unit_price:
                    medicine.unit_price ?? "",

                expiry_date:
                    medicine.expiry_date
                        ? medicine.expiry_date.split("T")[0]
                        : "",

                manufacturer:
                    medicine.manufacturer || ""

            });

        } else {

            setFormData({

                medicine_name: "",
                category: "",
                quantity: "",
                unit_price: "",
                expiry_date: "",
                manufacturer: ""

            });

        }

        setError("");

    }, [medicine]);


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
    SUBMIT
    ==================================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();


        const medicineName =
            formData.medicine_name.trim();

        const quantity =
            Number(formData.quantity);

        const unitPrice =
            Number(formData.unit_price);


        /*
        ==============================================
        VALIDATION
        ==============================================
        */

        if (!medicineName) {

            setError(
                "Please enter the medicine name."
            );

            return;

        }


        if (
            formData.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity < 0
        ) {

            setError(
                "Please enter a valid medicine quantity."
            );

            return;

        }


        if (
            formData.unit_price === "" ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {

            setError(
                "Please enter a valid unit price."
            );

            return;

        }


        try {

            setSubmitting(true);

            setError("");


            await onSave({

                medicine_name:
                    medicineName,

                category:
                    formData.category.trim(),

                quantity,

                unit_price:
                    unitPrice,

                expiry_date:
                    formData.expiry_date || null,

                manufacturer:
                    formData.manufacturer.trim()

            });

        } catch (err) {

            console.error(
                "❌ Medicine form submission failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to save medicine."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="medicine-form-card">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="medicine-form-header">

                <div className="medicine-form-title-row">

                    <div className="medicine-form-icon">

                        <Pill
                            size={22}
                            strokeWidth={2}
                        />

                    </div>


                    <div>

                        <h2>

                            {medicine
                                ? "Edit Medicine"
                                : "Add Medicine"}

                        </h2>

                        <p>

                            {medicine
                                ? "Update the medicine inventory information below."
                                : "Add a new medicine to the hospital inventory."
                            }

                        </p>

                    </div>

                </div>

            </div>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div
                    className="medicine-form-error"
                    role="alert"
                >

                    <span>

                        <AlertCircle
                            size={17}
                        />

                    </span>

                    <span>

                        {error}

                    </span>

                </div>

            )}


            {/* ==========================================
                FORM
            ========================================== */}

            <form
                onSubmit={handleSubmit}
                className="medicine-form"
            >


                {/* ======================================
                    MEDICINE INFORMATION
                ====================================== */}

                <div className="medicine-form-section">

                    <div className="medicine-form-section-title">

                        <Package size={17} />

                        <span>
                            Medicine Information
                        </span>

                    </div>


                    <div className="medicine-form-grid">


                        {/* MEDICINE NAME */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-name">

                                Medicine Name

                                <span>
                                    *
                                </span>

                            </label>

                            <div className="medicine-input-wrapper">

                                <Pill size={17} />

                                <input
                                    id="medicine-name"
                                    type="text"
                                    name="medicine_name"
                                    placeholder="e.g. Paracetamol 500mg"
                                    value={
                                        formData.medicine_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                    maxLength={150}
                                    autoComplete="off"
                                    required
                                />

                            </div>

                            <small>

                                Enter the generic or brand medicine name.

                            </small>

                        </div>


                        {/* CATEGORY */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-category">

                                Category

                            </label>

                            <div className="medicine-input-wrapper">

                                <Tag size={17} />

                                <select
                                    id="medicine-category"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Analgesic">
                                        Analgesic
                                    </option>

                                    <option value="Antibiotic">
                                        Antibiotic
                                    </option>

                                    <option value="Antimalarial">
                                        Antimalarial
                                    </option>

                                    <option value="Antihistamine">
                                        Antihistamine
                                    </option>

                                    <option value="Antacid">
                                        Antacid
                                    </option>

                                    <option value="Antiviral">
                                        Antiviral
                                    </option>

                                    <option value="Cardiovascular">
                                        Cardiovascular
                                    </option>

                                    <option value="Diabetes">
                                        Diabetes
                                    </option>

                                    <option value="Vitamins">
                                        Vitamins
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>

                            <small>

                                Choose the closest medicine category.

                            </small>

                        </div>


                        {/* QUANTITY */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-quantity">

                                Quantity

                                <span>
                                    *
                                </span>

                            </label>

                            <div className="medicine-input-wrapper">

                                <Package size={17} />

                                <input
                                    id="medicine-quantity"
                                    type="number"
                                    name="quantity"
                                    placeholder="e.g. 100"
                                    min="0"
                                    step="1"
                                    value={
                                        formData.quantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                    required
                                />

                            </div>

                            <small>

                                Current available stock quantity.

                            </small>

                        </div>


                        {/* UNIT PRICE */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-price">

                                Unit Price

                                <span>
                                    *
                                </span>

                            </label>

                            <div className="medicine-input-wrapper">

                                <Banknote size={17} />

                                <span className="medicine-currency">
                                    ₦
                                </span>

                                <input
                                    id="medicine-price"
                                    type="number"
                                    name="unit_price"
                                    placeholder="e.g. 1500.00"
                                    min="0"
                                    step="0.01"
                                    value={
                                        formData.unit_price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                    required
                                />

                            </div>

                            <small>

                                Enter the price for one unit.

                            </small>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    ADDITIONAL INFORMATION
                ====================================== */}

                <div className="medicine-form-section">

                    <div className="medicine-form-section-title">

                        <CalendarDays size={17} />

                        <span>
                            Additional Information
                        </span>

                    </div>


                    <div className="medicine-form-grid">


                        {/* EXPIRY DATE */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-expiry">

                                Expiry Date

                            </label>

                            <div className="medicine-input-wrapper">

                                <CalendarDays size={17} />

                                <input
                                    id="medicine-expiry"
                                    type="date"
                                    name="expiry_date"
                                    value={
                                        formData.expiry_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                />

                            </div>

                            <small>

                                Recommended for medicines with an expiry date.

                            </small>

                        </div>


                        {/* MANUFACTURER */}

                        <div className="medicine-form-group">

                            <label htmlFor="medicine-manufacturer">

                                Manufacturer

                            </label>

                            <div className="medicine-input-wrapper">

                                <Building2 size={17} />

                                <input
                                    id="medicine-manufacturer"
                                    type="text"
                                    name="manufacturer"
                                    placeholder="e.g. Emzor Pharmaceutical"
                                    value={
                                        formData.manufacturer
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                    maxLength={150}
                                    autoComplete="organization"
                                />

                            </div>

                            <small>

                                Enter the pharmaceutical manufacturer.

                            </small>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    ACTIONS
                ====================================== */}

                <div className="medicine-form-actions">

                    <button
                        type="button"
                        className="medicine-form-cancel"
                        onClick={onCancel}
                        disabled={submitting}
                    >

                        Cancel

                    </button>


                    <button
                        type="submit"
                        className="medicine-form-save"
                        disabled={submitting}
                    >

                        {submitting ? (

                            <>

                                <span className="medicine-button-spinner"></span>

                                {medicine
                                    ? "Updating..."
                                    : "Saving..."}

                            </>

                        ) : (

                            medicine
                                ? "Update Medicine"
                                : "Save Medicine"

                        )}

                    </button>

                </div>

            </form>

        </div>

    );

}


export default AddMedicineForm;
