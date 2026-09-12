import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";


import { useEffect, useMemo, useState } from "react";

import {
    Pill,
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    XCircle
} from "lucide-react";

import {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines
} from "../services/medicineService";

import AddMedicineForm from "../components/AddMedicineForm";

import "./Medicines.css";
import { formatMedicineId } from "../utils/hospitalIds";


function Medicines() {

    const [medicines, setMedicines] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingMedicine, setEditingMedicine] = useState(null);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(null);


    /*
    ==================================================
    LOAD MEDICINES
    ==================================================
    */

const loadMedicines = async () => {

        try {

            setLoading(true);

            const data =
                await getMedicines();

            setMedicines(
                Array.isArray(data?.medicines)
                    ? data.medicines
                    : []
            );

        } catch (err) {

            console.error(
                "❌ Failed to load medicines:",
                err
            );

            setMedicines([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadMedicines();

    }, []);


    


    /*
    ==================================================
    SEARCH
    ==================================================
    */

    const handleSearch = async (keyword) => {

        setSearch(keyword);

        const trimmedKeyword =
            keyword.trim();


        if (!trimmedKeyword) {

            await loadMedicines();

            return;

        }


        try {

            setLoading(true);

            const data =
                await searchMedicines(
                    trimmedKeyword
                );

            setMedicines(
                Array.isArray(data?.medicines)
                    ? data.medicines
                    : []
            );

        } catch (err) {

            console.error(
                "❌ Failed to search medicines:",
                err
            );

            setMedicines([]);

        } finally {

            setLoading(false);

        }

    };


    /*
    ==================================================
    CREATE / UPDATE
    ==================================================
    */

    const handleSaveMedicine = async (medicine) => {

        try {

            setActionLoading("save");


            if (editingMedicine) {

                const identifier =
                    editingMedicine.medicine_id ??
                    editingMedicine.id;


                if (
                    identifier === undefined ||
                    identifier === null
                ) {

                    throw new Error(
                        "Medicine ID is missing."
                    );

                }


                await updateMedicine(
                    identifier,
                    medicine
                );

                showToast(
                    "Medicine updated successfully!"
                );

            } else {

                await createMedicine(
                    medicine
                );

                showToast(
                    "Medicine added successfully!"
                );

            }


            setShowForm(false);

            setEditingMedicine(null);

            await loadMedicines();

        } catch (err) {

            console.error(
                "❌ Failed to save medicine:",
                err
            );

            showToast(
                err?.message ||
                "Failed to save medicine."
            );

        } finally {

            setActionLoading(null);

        }

    };


    /*
    ==================================================
    EDIT
    ==================================================
    */

    const handleEdit = (medicine) => {

        setEditingMedicine(
            medicine
        );

        setShowForm(true);

    };


    /*
    ==================================================
    DELETE
    ==================================================
    */

    const handleDelete = async (medicine) => {

        const identifier =
            medicine?.medicine_id ??
            medicine?.id;


        if (
            identifier === undefined ||
            identifier === null
        ) {

            showToast(
                "Cannot delete medicine: ID is missing."
            );

            return;

        }


        const confirmDelete = await confirmAction({
            title: "Delete medicine?",
            message: `Are you sure you want to delete "${medicine.medicine_name}"? This action cannot be undone.`,
            confirmText: "Delete medicine",
        });


        if (!confirmDelete) {

            return;

        }


        try {

            setActionLoading(
                `delete-${identifier}`
            );


            await deleteMedicine(
                identifier
            );


            await loadMedicines();


            showToast(
                "Medicine deleted successfully!"
            );

        } catch (err) {

            console.error(
                "❌ Failed to delete medicine:",
                err
            );

            showToast(
                err?.message ||
                "Failed to delete medicine."
            );

        } finally {

            setActionLoading(null);

        }

    };


    /*
    ==================================================
    FORM CANCEL
    ==================================================
    */

    const handleCancel = () => {

        setShowForm(false);

        setEditingMedicine(null);

    };


    /*
    ==================================================
    EXPIRY STATUS
    ==================================================
    */

    const getExpiryStatus = (expiryDate) => {

        if (!expiryDate) {

            return {
                label: "No expiry",
                className: "medicine-expiry-none",
                icon: <AlertTriangle size={14} />
            };

        }


        const expiry =
            new Date(expiryDate);

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        expiry.setHours(
            0,
            0,
            0,
            0
        );


        if (expiry < today) {

            return {
                label: "Expired",
                className: "medicine-expiry-expired",
                icon: <XCircle size={14} />
            };

        }


        const difference =
            expiry - today;


        const days =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (days <= 30) {

            return {
                label: "Expiring Soon",
                className: "medicine-expiry-warning",
                icon: <CalendarClock size={14} />
            };

        }


        return {
            label: "Valid",
            className: "medicine-expiry-valid",
            icon: <CheckCircle2 size={14} />
        };

    };


    /*
    ==================================================
    STOCK STATUS
    ==================================================
    */

    const getStockStatus = (quantity) => {

        const stock =
            Number(quantity) || 0;


        if (stock <= 0) {

            return "out";

        }


        if (stock <= 10) {

            return "low";

        }


        return "normal";

    };


    /*
    ==================================================
    SUMMARY
    ==================================================
    */

    const summary = useMemo(() => {

        const total =
            medicines.length;


        const lowStock =
            medicines.filter(
                (medicine) =>
                    Number(medicine.quantity) > 0 &&
                    Number(medicine.quantity) <= 10
            ).length;


        const outOfStock =
            medicines.filter(
                (medicine) =>
                    Number(medicine.quantity) <= 0
            ).length;


        const expiringSoon =
            medicines.filter(
                (medicine) => {

                    const status =
                        getExpiryStatus(
                            medicine.expiry_date
                        );

                    return (
                        status.className ===
                        "medicine-expiry-warning"
                    );

                }
            ).length;


        const expired =
            medicines.filter(
                (medicine) => {

                    const status =
                        getExpiryStatus(
                            medicine.expiry_date
                        );

                    return (
                        status.className ===
                        "medicine-expiry-expired"
                    );

                }
            ).length;


        return {
            total,
            lowStock,
            outOfStock,
            expiringSoon,
            expired
        };

    }, [medicines]);


    /*
    ==================================================
    RENDER
    ==================================================
    */

    return (

        <div className="hms-page page-container medicines-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="medicines-header">

                <div className="medicines-header-content">

                    <div className="medicines-title-row">

                        <div className="medicines-title-icon">

                            <Pill
                                size={22}
                                strokeWidth={2}
                            />

                        </div>

                        <div>

                            <h1 className="medicines-title">
                                Medicines
                            </h1>

                            <p className="medicines-subtitle">

                                Manage hospital medicine
                                inventory and stock.

                            </p>

                        </div>

                    </div>

                </div>


                <button
                    className="medicine-add-btn"
                    onClick={() => {

                        setEditingMedicine(null);

                        setShowForm(true);

                    }}
                    disabled={
                        actionLoading === "save"
                    }
                >

                    <Plus size={18} />

                    Add Medicine

                </button>

            </div>


            {/* ==========================================
                SUMMARY
            ========================================== */}

            {!loading && (

                <div className="medicines-summary">


                    {/* TOTAL */}

                    <div className="medicine-summary-card">

                        <div className="medicine-summary-icon total">

                            <Package size={20} />

                        </div>

                        <div>

                            <span>
                                Total Medicines
                            </span>

                            <strong>
                                {summary.total}
                            </strong>

                        </div>

                    </div>


                    {/* LOW STOCK */}

                    <div className="medicine-summary-card">

                        <div className="medicine-summary-icon low">

                            <AlertTriangle size={20} />

                        </div>

                        <div>

                            <span>
                                Low Stock
                            </span>

                            <strong>
                                {summary.lowStock}
                            </strong>

                        </div>

                    </div>


                    {/* OUT OF STOCK */}

                    <div className="medicine-summary-card">

                        <div className="medicine-summary-icon out">

                            <XCircle size={20} />

                        </div>

                        <div>

                            <span>
                                Out of Stock
                            </span>

                            <strong>
                                {summary.outOfStock}
                            </strong>

                        </div>

                    </div>


                    {/* EXPIRING */}

                    <div className="medicine-summary-card">

                        <div className="medicine-summary-icon expiry">

                            <CalendarClock size={20} />

                        </div>

                        <div>

                            <span>
                                Expiring Soon
                            </span>

                            <strong>
                                {summary.expiringSoon}
                            </strong>

                        </div>

                    </div>


                    {/* EXPIRED */}

                    <div className="medicine-summary-card">

                        <div className="medicine-summary-icon expired">

                            <XCircle size={20} />

                        </div>

                        <div>

                            <span>
                                Expired
                            </span>

                            <strong>
                                {summary.expired}
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================================
                SEARCH
            ========================================== */}

            <div className="medicines-toolbar">

                <div className="medicine-search">

                    <Search
                        size={17}
                        className="medicine-search-icon"
                    />

                    <input
                        type="text"
                        placeholder="Search medicine, category or manufacturer..."
                        value={search}
                        onChange={(e) =>
                            handleSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            className="medicine-search-clear"
                            onClick={() =>
                                handleSearch("")
                            }
                            aria-label="Clear search"
                        >

                            ×

                        </button>

                    )}

                </div>

            </div>


            {/* ==========================================
                FORM
            ========================================== */}

            {showForm && (

                <AddMedicineForm

                    medicine={
                        editingMedicine
                    }

                    onSave={
                        handleSaveMedicine
                    }

                    onCancel={
                        handleCancel
                    }

                />

            )}


            {/* ==========================================
                LOADING
            ========================================== */}

            {loading ? (

                <div className="medicines-loading">

                    <div className="medicines-spinner"></div>

                    <p>
                        Loading medicine inventory...
                    </p>

                </div>

            ) : (

                <div className="medicines-table-wrapper">

                    <table className="medicines-table">

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Medicine
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Stock
                                </th>

                                <th>
                                    Unit Price
                                </th>

                                <th>
                                    Expiry
                                </th>

                                <th>
                                    Manufacturer
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {medicines.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="medicines-empty"
                                    >

                                        <div className="medicines-empty-icon">

                                            <Pill
                                                size={32}
                                            />

                                        </div>

                                        <strong>
                                            No medicines found
                                        </strong>

                                        <span>

                                            {search
                                                ? "Try a different medicine, category or manufacturer."
                                                : "Your medicine inventory is currently empty."
                                            }

                                        </span>


                                        {!search && (

                                            <button
                                                className="medicine-empty-btn"
                                                onClick={() => {

                                                    setEditingMedicine(null);

                                                    setShowForm(true);

                                                }}
                                            >

                                                <Plus size={16} />

                                                Add First Medicine

                                            </button>

                                        )}

                                    </td>

                                </tr>

                            ) : (

                                medicines.map(
                                    (medicine) => {

                                        const identifier =
                                            medicine.medicine_id ??
                                            medicine.id;


                                        const expiryStatus =
                                            getExpiryStatus(
                                                medicine.expiry_date
                                            );


                                        const stockStatus =
                                            getStockStatus(
                                                medicine.quantity
                                            );


                                        const isDeleting =
                                            actionLoading ===
                                            `delete-${identifier}`;


                                        return (

                                            <tr
                                                key={
                                                    identifier
                                                }
                                            >


                                                {/* ID */}

                                                <td className="medicine-id">

                                                    {formatMedicineId(identifier)}

                                                </td>


                                                {/* MEDICINE */}

                                                <td>

                                                    <div className="medicine-name">

                                                        <div className="medicine-icon">

                                                            <Pill
                                                                size={17}
                                                            />

                                                        </div>

                                                        <div>

                                                            <strong>

                                                                {
                                                                    medicine.medicine_name ||
                                                                    "Unnamed Medicine"
                                                                }

                                                            </strong>

                                                            <small>

                                                                Medicine #{identifier}

                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* CATEGORY */}

                                                <td>

                                                    <span className="medicine-category">

                                                        {
                                                            medicine.category ||
                                                            "—"
                                                        }

                                                    </span>

                                                </td>


                                                {/* STOCK */}

                                                <td>

                                                    <div
                                                        className={
                                                            `medicine-stock ${stockStatus}`
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                medicine.quantity ?? 0
                                                            }
                                                        </strong>

                                                        <span>

                                                            {stockStatus === "out"
                                                                ? "Out of stock"
                                                                : stockStatus === "low"
                                                                    ? "Low stock"
                                                                    : "In stock"
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* PRICE */}

                                                <td className="medicine-price">

                                                    ₦
                                                    {Number(
                                                        medicine.unit_price
                                                    ).toLocaleString(
                                                        "en-NG",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )}

                                                </td>


                                                {/* EXPIRY */}

                                                <td>

                                                    <div className="medicine-expiry">

                                                        <strong>

                                                            {medicine.expiry_date
                                                                ? new Date(
                                                                    medicine.expiry_date
                                                                ).toLocaleDateString(
                                                                    "en-NG",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    }
                                                                )
                                                                : "—"
                                                            }

                                                        </strong>

                                                        {medicine.expiry_date && (

                                                            <span
                                                                className={
                                                                    `medicine-expiry-status ${expiryStatus.className}`
                                                                }
                                                            >

                                                                {
                                                                    expiryStatus.icon
                                                                }

                                                                {
                                                                    expiryStatus.label
                                                                }

                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* MANUFACTURER */}

                                                <td>

                                                    {
                                                        medicine.manufacturer ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `medicine-overall-status ${stockStatus}`
                                                        }
                                                    >

                                                        {stockStatus === "out" ? (

                                                            <>
                                                                <XCircle size={14} />
                                                                Out of Stock
                                                            </>

                                                        ) : stockStatus === "low" ? (

                                                            <>
                                                                <AlertTriangle size={14} />
                                                                Low Stock
                                                            </>

                                                        ) : (

                                                            <>
                                                                <CheckCircle2 size={14} />
                                                                Available
                                                            </>

                                                        )}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="medicine-actions">

                                                        <button
                                                            className="medicine-action-btn medicine-edit-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    medicine
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading !== null
                                                            }
                                                            title="Edit medicine"
                                                        >

                                                            <Pencil size={14} />

                                                            Edit

                                                        </button>


                                                        <button
                                                            className="medicine-action-btn medicine-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    medicine
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading !== null
                                                            }
                                                            title="Delete medicine"
                                                        >

                                                            <Trash2 size={14} />

                                                            {isDeleting
                                                                ? "Deleting..."
                                                                : "Delete"
                                                            }

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default Medicines;
