import { useEffect, useMemo, useState } from "react";

import {
    X,
    Pill,
    Search,
    Plus,
    Trash2,
    Save,
    WifiOff,
    ClipboardList,
    UserRound,
    Stethoscope,
    CalendarDays,
    ChevronDown
} from "lucide-react";

import {
    createPrescription,
    getPrescriptionsByRecord,
    replacePrescriptionItems,
    updatePrescription
} from "../services/prescriptionService";

import {
    getMedicines,
    searchMedicines
} from "../services/medicineService";

import "./PrescriptionForm.css";


/*
==================================================
HELPERS
==================================================
*/

const getMedicineId = (medicine) =>
    medicine?.medicine_id ??
    medicine?.id ??
    null;


const getMedicineName = (medicine) =>
    medicine?.medicine_name ??
    medicine?.name ??
    "";


const getRecordId = (record) =>
    record?.record_id ??
    record?.id ??
    null;


const getPatientName = (patient) => {

    if (patient?.name) {
        return patient.name;
    }

    return [
        patient?.first_name,
        patient?.last_name
    ]
        .filter(Boolean)
        .join(" ");
};


const getDoctorName = (record) => {

    if (record?.doctor_name) {
        return record.doctor_name;
    }

    return [
        record?.doctor_first_name,
        record?.doctor_last_name
    ]
        .filter(Boolean)
        .join(" ");
};


const getToday = () =>
    new Date().toISOString().split("T")[0];


const createEmptyItem = () => ({
    medicine_id: "",
    medicine_name: "",
    strength: "",
    dosage: "",
    frequency: "",
    duration: "",
    route: "Oral",
    instructions: ""
});


/*
==================================================
COMPONENT
==================================================
*/

const PrescriptionForm = ({
    patient,
    record,
    prescription = null,
    onClose,
    onSuccess,
    onCancel,
    onSave
}) => {

    /*
    ----------------------------------------------
    BASIC MODE
    ----------------------------------------------
    */

    const isEditing =
        Boolean(
            prescription?.prescription_id ??
            prescription?.id
        );


    /*
    ----------------------------------------------
    STATE
    ----------------------------------------------
    */

    const [medicines, setMedicines] =
        useState([]);

    const [items, setItems] =
        useState([]);

    const [prescriptionDate, setPrescriptionDate] =
        useState(
            prescription?.prescription_date
                ? String(
                    prescription.prescription_date
                ).slice(0, 10)
                : getToday()
        );

    const [notes, setNotes] =
        useState(
            prescription?.notes ||
            ""
        );

    const [searchTerm, setSearchTerm] =
        useState("");

    const [searchResults, setSearchResults] =
        useState([]);

    const [showSearchResults, setShowSearchResults] =
        useState(false);

    const [loadingMedicines, setLoadingMedicines] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [offline, setOffline] =
        useState(!navigator.onLine);


    /*
    ----------------------------------------------
    NETWORK STATUS
    ----------------------------------------------
    */

    useEffect(() => {

        const handleOnline = () =>
            setOffline(false);

        const handleOffline = () =>
            setOffline(true);


        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener(
            "offline",
            handleOffline
        );


        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "offline",
                handleOffline
            );

        };

    }, []);


    /*
    ----------------------------------------------
    LOAD MEDICINES
    ----------------------------------------------
    */

    useEffect(() => {

        let cancelled = false;


        const loadMedicines = async () => {

            setLoadingMedicines(true);

            try {

                const response =
                    await getMedicines();

                if (cancelled) {
                    return;
                }

                setMedicines(
                    response?.medicines || []
                );

            } catch (err) {

                console.error(
                    "Failed to load medicines:",
                    err
                );

                if (!cancelled) {

                    setError(
                        "Unable to load medicines."
                    );

                }

            } finally {

                if (!cancelled) {
                    setLoadingMedicines(false);
                }

            }

        };


        loadMedicines();


        return () => {
            cancelled = true;
        };

    }, []);


    /*
    ----------------------------------------------
    LOAD EXISTING ITEMS
    ----------------------------------------------
    */

    useEffect(() => {

        const loadExistingPrescription =
            async () => {

                /*
                If a complete prescription object
                already contains items, use them.
                */

                if (
                    prescription?.items &&
                    Array.isArray(
                        prescription.items
                    )
                ) {

                    setItems(
                        prescription.items.map(
                            item => ({
                                medicine_id:
                                    item.medicine_id ??
                                    item.id ??
                                    "",

                                medicine_name:
                                    item.medicine_name ??
                                    item.name ??
                                    "",

                                strength:
                                    item.strength ??
                                    item.dosage_strength ??
                                    "",

                                dosage:
                                    item.dosage ??
                                    "",

                                frequency:
                                    item.frequency ??
                                    "",

                                duration:
                                    item.duration ??
                                    "",

                                route:
                                    item.route ??
                                    "Oral",

                                instructions:
                                    item.instructions ??
                                    item.instruction ??
                                    ""
                            })
                        )
                    );

                    return;
                }


                /*
                If editing but items were not included,
                retrieve the prescription from the
                prescription service.
                */

                const prescriptionId =
                    prescription?.prescription_id ??
                    prescription?.id;


                if (
                    prescriptionId &&
                    !prescription?.items
                ) {

                    try {

                        const response =
                            await getPrescriptionsByRecord(
                                getRecordId(record)
                            );


                        const prescriptions =
                            Array.isArray(response)
                                ? response
                                : response?.prescriptions || [];


                        const found =
                            prescriptions.find(
                                item =>
                                    String(
                                        item.prescription_id ??
                                        item.id
                                    ) ===
                                    String(
                                        prescriptionId
                                    )
                            );


                        if (
                            found?.items &&
                            Array.isArray(found.items)
                        ) {

                            setItems(
                                found.items.map(
                                    item => ({
                                        medicine_id:
                                            item.medicine_id ??
                                            item.id ??
                                            "",

                                        medicine_name:
                                            item.medicine_name ??
                                            item.name ??
                                            "",

                                        strength:
                                            item.strength ??
                                            "",

                                        dosage:
                                            item.dosage ??
                                            "",

                                        frequency:
                                            item.frequency ??
                                            "",

                                        duration:
                                            item.duration ??
                                            "",

                                        route:
                                            item.route ??
                                            "Oral",

                                        instructions:
                                            item.instructions ??
                                            item.instruction ??
                                            ""
                                    })
                                )
                            );

                        }

                    } catch (err) {

                        console.warn(
                            "Unable to load existing prescription items:",
                            err
                        );

                    }

                }

            };


        loadExistingPrescription();

    }, [prescription, record]);


    /*
    ----------------------------------------------
    SEARCH
    ----------------------------------------------
    */

    useEffect(() => {

        const keyword =
            searchTerm.trim();


        if (!keyword) {

            setSearchResults([]);
            setShowSearchResults(false);

            return;
        }


        let cancelled = false;


        const timer =
            setTimeout(
                async () => {

                    try {

                        const response =
                            await searchMedicines(
                                keyword
                            );


                        if (cancelled) {
                            return;
                        }


                        const results =
                            response?.medicines || [];


                        setSearchResults(
                            results
                        );

                        setShowSearchResults(
                            true
                        );

                    } catch (err) {

                        console.error(
                            "Medicine search failed:",
                            err
                        );

                        if (!cancelled) {

                            /*
                            Local fallback against
                            already-loaded medicines.
                            */

                            const lower =
                                keyword.toLowerCase();


                            const fallback =
                                medicines.filter(
                                    medicine => {

                                        const name =
                                            getMedicineName(
                                                medicine
                                            ).toLowerCase();

                                        const category =
                                            String(
                                                medicine.category ||
                                                ""
                                            ).toLowerCase();


                                        return (
                                            name.includes(
                                                lower
                                            ) ||
                                            category.includes(
                                                lower
                                            )
                                        );

                                    }
                                );


                            setSearchResults(
                                fallback
                            );

                            setShowSearchResults(
                                true
                            );

                        }

                    }

                },
                300
            );


        return () => {

            cancelled = true;
            clearTimeout(timer);

        };

    }, [
        searchTerm,
        medicines
    ]);


    /*
    ----------------------------------------------
    FILTER DUPLICATES
    ----------------------------------------------
    */

    const availableSearchResults =
        useMemo(() => {

            const selectedIds =
                new Set(
                    items
                        .map(
                            item =>
                                item.medicine_id
                        )
                        .filter(Boolean)
                        .map(String)
                );


            return searchResults.filter(
                medicine => {

                    const id =
                        getMedicineId(
                            medicine
                        );


                    if (!id) {
                        return false;
                    }


                    return !selectedIds.has(
                        String(id)
                    );

                }
            );

        }, [
            searchResults,
            items
        ]);


    /*
    ----------------------------------------------
    SELECT MEDICINE
    ----------------------------------------------
    */

    const handleSelectMedicine =
        (medicine) => {

            const medicineId =
                getMedicineId(
                    medicine
                );


            const medicineName =
                getMedicineName(
                    medicine
                );


            if (!medicineId) {

                setError(
                    "Selected medicine does not have a valid medicine ID."
                );

                return;
            }


            setItems(
                previous => [
                    ...previous,
                    {
                        ...createEmptyItem(),

                        medicine_id:
                            medicineId,

                        medicine_name:
                            medicineName
                    }
                ]
            );


            setSearchTerm("");
            setSearchResults([]);
            setShowSearchResults(false);
            setError("");

        };


    /*
    ----------------------------------------------
    UPDATE ITEM
    ----------------------------------------------
    */

    const handleItemChange =
        (index, field, value) => {

            setItems(
                previous =>
                    previous.map(
                        (item, itemIndex) =>
                            itemIndex === index
                                ? {
                                    ...item,
                                    [field]: value
                                }
                                : item
                    )
            );

        };


    /*
    ----------------------------------------------
    REMOVE ITEM
    ----------------------------------------------
    */

    const handleRemoveItem =
        (index) => {

            setItems(
                previous =>
                    previous.filter(
                        (_, itemIndex) =>
                            itemIndex !== index
                    )
            );

        };


    /*
    ----------------------------------------------
    ADD BLANK ITEM
    ----------------------------------------------
    */

    const handleAddBlankItem =
        () => {

            setItems(
                previous => [
                    ...previous,
                    createEmptyItem()
                ]
            );

        };


    /*
    ----------------------------------------------
    VALIDATION
    ----------------------------------------------
    */

    const validateForm =
        () => {

            const recordId =
                getRecordId(record);


            if (!recordId) {

                return "Medical record ID is missing.";

            }


            if (!record?.patient_id &&
                !patient?.patient_id) {

                return "Patient ID is missing.";

            }


            if (!record?.doctor_id) {

                return "Doctor ID is missing from the medical record.";

            }


            if (!items.length) {

                return "Add at least one medicine to the prescription.";

            }


            for (
                let index = 0;
                index < items.length;
                index++
            ) {

                const item =
                    items[index];


                if (!item.medicine_id) {

                    return `Please select a medicine for item ${index + 1}.`;

                }


                if (!item.dosage.trim()) {

                    return `Please enter the dosage for ${item.medicine_name}.`;

                }


                if (!item.frequency.trim()) {

                    return `Please enter the frequency for ${item.medicine_name}.`;

                }


                if (!item.duration.trim()) {

                    return `Please enter the duration for ${item.medicine_name}.`;

                }

            }


            return null;

        };


    /*
    ----------------------------------------------
    SAVE
    ----------------------------------------------
    */

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");


            const validationError =
                validateForm();


            if (validationError) {

                setError(
                    validationError
                );

                return;

            }


            setSaving(true);


            try {

                const patientId =
                    record?.patient_id ??
                    patient?.patient_id;


                const doctorId =
                    record?.doctor_id;


                const prescriptionId =
                    prescription?.prescription_id ??
                    prescription?.id;


                const cleanItems =
                    items.map(
                        item => ({
                            medicine_id:
                                Number(
                                    item.medicine_id
                                ),

                            strength:
                                item.strength.trim() ||
                                null,

                            dosage:
                                item.dosage.trim(),

                            frequency:
                                item.frequency.trim(),

                            duration:
                                item.duration.trim(),

                            route:
                                item.route.trim() ||
                                null,

                            instructions:
                                item.instructions.trim() ||
                                null
                        })
                    );


                let response;


                /*
                ----------------------------------
                UPDATE
                ----------------------------------
                */

                if (
                    isEditing &&
                    prescriptionId
                ) {

                    response =
                        await updatePrescription(
                            prescriptionId,
                            {
                                prescription_date:
                                    prescriptionDate,

                                notes:
                                    notes.trim() ||
                                    null,

                                status:
                                    prescription.status ||
                                    "active"
                            }
                        );


                    await replacePrescriptionItems(
                        prescriptionId,
                        cleanItems
                    );

                }


                /*
                ----------------------------------
                CREATE
                ----------------------------------
                */

                else {

                    response =
                        await createPrescription({

                            record_id:
                                Number(
                                    getRecordId(
                                        record
                                    )
                                ),

                            patient_id:
                                Number(
                                    patientId
                                ),

                            doctor_id:
                                Number(
                                    doctorId
                                ),

                            prescription_date:
                                prescriptionDate,

                            notes:
                                notes.trim() ||
                                null,

                            status:
                                "active",

                            items:
                                cleanItems

                        });

                }


                /*
                ----------------------------------
                SUCCESS
                ----------------------------------
                */

                const savedPrescription =
                    response?.prescription ||
                    response?.data?.prescription ||
                    response;


                if (onSuccess) {

                    await onSuccess(
                        savedPrescription
                    );

                }


                if (onSave) {

                    await onSave(
                        savedPrescription
                    );

                }


                if (onClose) {

                    onClose();

                }

                else if (onCancel) {

                    onCancel();

                }


            } catch (err) {

                console.error(
                    "🔥 Prescription save failed:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save prescription."
                );

            } finally {

                setSaving(false);

            }

        };


    /*
    ----------------------------------------------
    CLOSE
    ----------------------------------------------
    */

    const handleClose =
        () => {

            if (onClose) {
                onClose();
            }
            else if (onCancel) {
                onCancel();
            }

        };


    /*
    ----------------------------------------------
    RENDER
    ----------------------------------------------
    */

    return (
        <div
            className="prescription-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleClose();
                }

            }}
        >

            <div className="prescription-modal">


                {/* HEADER */}

                <div className="prescription-header">

                    <div className="prescription-title">

                        <div className="prescription-title-icon">
                            <Pill size={22} />
                        </div>

                        <div>

                            <h2>
                                {isEditing
                                    ? "Edit Prescription"
                                    : "New Prescription"
                                }
                            </h2>

                            <p>
                                Structured medication prescription
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="prescription-close"
                        onClick={handleClose}
                        aria-label="Close prescription form"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* OFFLINE NOTICE */}

                {offline && (

                    <div className="prescription-offline">

                        <WifiOff size={17} />

                        <span>
                            You are offline. This prescription will be
                            saved locally and synchronized when connection returns.
                        </span>

                    </div>

                )}


                {/* ERROR */}

                {error && (

                    <div className="prescription-error">

                        <strong>
                            Unable to save prescription
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                <form
                    className="prescription-form"
                    onSubmit={handleSubmit}
                >


                    {/* PATIENT / DOCTOR */}

                    <section className="prescription-section">

                        <div className="section-heading">

                            <ClipboardList size={18} />

                            <div>
                                <h3>
                                    Prescription Details
                                </h3>

                                <p>
                                    Patient and attending clinician
                                </p>
                            </div>

                        </div>


                        <div className="prescription-info-grid">

                            <div className="info-card">

                                <UserRound size={17} />

                                <div>

                                    <span>
                                        Patient
                                    </span>

                                    <strong>
                                        {getPatientName(patient) ||
                                            "Unknown patient"}
                                    </strong>

                                </div>

                            </div>


                            <div className="info-card">

                                <Stethoscope size={17} />

                                <div>

                                    <span>
                                        Doctor
                                    </span>

                                    <strong>
                                        {getDoctorName(record) ||
                                            "Unknown doctor"}
                                    </strong>

                                </div>

                            </div>


                            <label className="field-group">

                                <span>
                                    Prescription Date
                                </span>

                                <div className="input-icon-wrapper">

                                    <CalendarDays size={17} />

                                    <input
                                        type="date"
                                        value={
                                            prescriptionDate
                                        }
                                        onChange={(event) =>
                                            setPrescriptionDate(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </label>

                        </div>

                    </section>


                    {/* MEDICINE SEARCH */}

                    <section className="prescription-section">

                        <div className="section-heading">

                            <Pill size={18} />

                            <div>
                                <h3>
                                    Medicines
                                </h3>

                                <p>
                                    Add one or more medicines to this prescription
                                </p>
                            </div>

                        </div>


                        <div className="medicine-search-area">

                            <div className="medicine-search-wrapper">

                                <Search
                                    size={18}
                                    className="medicine-search-icon"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(
                                            event.target.value
                                        )
                                    }
                                    onFocus={() => {

                                        if (
                                            searchResults.length
                                        ) {
                                            setShowSearchResults(
                                                true
                                            );
                                        }

                                    }}
                                    placeholder={
                                        loadingMedicines
                                            ? "Loading medicines..."
                                            : "Search medicine name, category or manufacturer..."
                                    }
                                    disabled={
                                        loadingMedicines
                                    }
                                />


                                {searchTerm && (

                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => {

                                            setSearchTerm("");
                                            setSearchResults([]);
                                            setShowSearchResults(false);

                                        }}
                                    >
                                        <X size={16} />
                                    </button>

                                )}


                                {showSearchResults && (

                                    <div className="medicine-search-results">

                                        {availableSearchResults.length > 0 ? (

                                            availableSearchResults.map(
                                                medicine => {

                                                    const id =
                                                        getMedicineId(
                                                            medicine
                                                        );

                                                    return (

                                                        <button
                                                            type="button"
                                                            key={id}
                                                            className="medicine-result"
                                                            onClick={() =>
                                                                handleSelectMedicine(
                                                                    medicine
                                                                )
                                                            }
                                                        >

                                                            <div className="medicine-result-icon">
                                                                <Pill size={17} />
                                                            </div>

                                                            <div className="medicine-result-content">

                                                                <strong>
                                                                    {getMedicineName(
                                                                        medicine
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    {medicine.category ||
                                                                        "Medicine"}

                                                                    {medicine.manufacturer
                                                                        ? ` • ${medicine.manufacturer}`
                                                                        : ""}
                                                                </span>

                                                            </div>

                                                            <Plus size={18} />

                                                        </button>

                                                    );

                                                }
                                            )

                                        ) : (

                                            <div className="medicine-no-results">

                                                <Pill size={20} />

                                                <span>
                                                    No available medicine found.
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>


                            <button
                                type="button"
                                className="add-blank-medicine"
                                onClick={
                                    handleAddBlankItem
                                }
                            >
                                <Plus size={17} />
                                Add medicine manually
                            </button>

                        </div>


                        {/* SELECTED MEDICINES */}

                        <div className="selected-medicines">

                            {items.length === 0 ? (

                                <div className="empty-medicines">

                                    <Pill size={30} />

                                    <h4>
                                        No medicines added yet
                                    </h4>

                                    <p>
                                        Search the medicine catalog above
                                        to add medication.
                                    </p>

                                </div>

                            ) : (

                                items.map(
                                    (item, index) => (

                                        <div
                                            className="medicine-item-card"
                                            key={`${item.medicine_id || "manual"}-${index}`}
                                        >

                                            <div className="medicine-item-header">

                                                <div className="medicine-item-number">
                                                    {index + 1}
                                                </div>

                                                <div className="medicine-item-name">

                                                    <strong>
                                                        {item.medicine_name ||
                                                            "Medicine not selected"}
                                                    </strong>

                                                    {item.medicine_id && (

                                                        <span>
                                                            Medicine ID:{" "}
                                                            {item.medicine_id}
                                                        </span>

                                                    )}

                                                </div>


                                                <button
                                                    type="button"
                                                    className="remove-medicine"
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            index
                                                        )
                                                    }
                                                    title="Remove medicine"
                                                >
                                                    <Trash2 size={17} />
                                                </button>

                                            </div>


                                            <div className="medicine-item-fields">

                                                <label className="field-group">

                                                    <span>
                                                        Strength
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={
                                                            item.strength
                                                        }
                                                        onChange={(event) =>
                                                            handleItemChange(
                                                                index,
                                                                "strength",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. 500mg"
                                                    />

                                                </label>


                                                <label className="field-group">

                                                    <span>
                                                        Dosage *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={
                                                            item.dosage
                                                        }
                                                        onChange={(event) =>
                                                            handleItemChange(
                                                                index,
                                                                "dosage",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. 1 tablet"
                                                    />

                                                </label>


                                                <label className="field-group">

                                                    <span>
                                                        Frequency *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={
                                                            item.frequency
                                                        }
                                                        onChange={(event) =>
                                                            handleItemChange(
                                                                index,
                                                                "frequency",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. 3 times daily"
                                                    />

                                                </label>


                                                <label className="field-group">

                                                    <span>
                                                        Duration *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={
                                                            item.duration
                                                        }
                                                        onChange={(event) =>
                                                            handleItemChange(
                                                                index,
                                                                "duration",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. 5 days"
                                                    />

                                                </label>


                                                <label className="field-group">

                                                    <span>
                                                        Route
                                                    </span>

                                                    <div className="select-wrapper">

                                                        <select
                                                            value={
                                                                item.route
                                                            }
                                                            onChange={(event) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "route",
                                                                    event.target.value
                                                                )
                                                            }
                                                        >

                                                            <option value="Oral">
                                                                Oral
                                                            </option>

                                                            <option value="Intravenous">
                                                                Intravenous
                                                            </option>

                                                            <option value="Intramuscular">
                                                                Intramuscular
                                                            </option>

                                                            <option value="Subcutaneous">
                                                                Subcutaneous
                                                            </option>

                                                            <option value="Topical">
                                                                Topical
                                                            </option>

                                                            <option value="Sublingual">
                                                                Sublingual
                                                            </option>

                                                            <option value="Rectal">
                                                                Rectal
                                                            </option>

                                                            <option value="Vaginal">
                                                                Vaginal
                                                            </option>

                                                            <option value="Inhalation">
                                                                Inhalation
                                                            </option>

                                                            <option value="Other">
                                                                Other
                                                            </option>

                                                        </select>

                                                        <ChevronDown
                                                            size={16}
                                                        />

                                                    </div>

                                                </label>


                                                <label className="field-group field-full">

                                                    <span>
                                                        Instructions
                                                    </span>

                                                    <textarea
                                                        value={
                                                            item.instructions
                                                        }
                                                        onChange={(event) =>
                                                            handleItemChange(
                                                                index,
                                                                "instructions",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="e.g. Take after meals"
                                                        rows={2}
                                                    />

                                                </label>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </section>


                    {/* NOTES */}

                    <section className="prescription-section">

                        <div className="section-heading">

                            <ClipboardList size={18} />

                            <div>

                                <h3>
                                    Prescription Notes
                                </h3>

                                <p>
                                    Additional instructions for the patient
                                </p>

                            </div>

                        </div>


                        <textarea
                            className="prescription-notes"
                            value={notes}
                            onChange={(event) =>
                                setNotes(
                                    event.target.value
                                )
                            }
                            placeholder="Add any additional prescription instructions or notes..."
                            rows={4}
                        />

                    </section>


                    {/* FOOTER */}

                    <div className="prescription-footer">

                        <div className="prescription-summary">

                            <Pill size={17} />

                            <span>
                                {items.length}{" "}
                                {items.length === 1
                                    ? "medicine"
                                    : "medicines"}
                            </span>

                        </div>


                        <div className="prescription-actions">

                            <button
                                type="button"
                                className="prescription-cancel"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="prescription-save"
                                disabled={
                                    saving ||
                                    !items.length
                                }
                            >

                                {saving ? (

                                    <>
                                        <span className="button-spinner" />
                                        Saving...
                                    </>

                                ) : (

                                    <>
                                        <Save size={17} />

                                        {isEditing
                                            ? "Update Prescription"
                                            : "Save Prescription"
                                        }
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );

};


export default PrescriptionForm;