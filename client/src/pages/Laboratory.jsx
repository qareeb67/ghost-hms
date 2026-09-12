import { confirmAction } from "../components/ConfirmDialog";
import { showToast } from "../utils/notificationService";

import { useEffect, useMemo, useState } from "react";

import {
    FlaskConical,
    Plus,
    Pencil,
    CheckCircle2,
    Trash2,
    Clock3,
    TestTube2,
    AlertCircle
} from "lucide-react";

import {
    getLaboratoryTests,
    createLaboratoryTest,
    updateLaboratoryTest,
    deleteLaboratoryTest,
    completeLaboratoryTest
} from "../services/laboratoryService";

import AddLaboratoryForm from "../components/AddLaboratoryForm";

import "./Laboratory.css";
import { formatLaboratoryId } from "../utils/hospitalIds";


function Laboratory() {

    const [laboratoryTests, setLaboratoryTests] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [editingTest, setEditingTest] = useState(null);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(null);


    // ==================================================
    // LOAD LABORATORY TESTS
    // ==================================================

const loadLaboratoryTests = async () => {

        try {

            setLoading(true);

            const data =
                await getLaboratoryTests();

            setLaboratoryTests(
                Array.isArray(data?.laboratoryTests)
                    ? data.laboratoryTests
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load laboratory tests:",
                err
            );

            setLaboratoryTests([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadLaboratoryTests();

        const handleSyncComplete = () => {
            loadLaboratoryTests();
        };

        const handleOnline = () => {
            loadLaboratoryTests();
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

    }, []);


    


    // ==================================================
    // SUMMARY
    // ==================================================

    const summary = useMemo(() => {

        const total =
            laboratoryTests.length;

        const pending =
            laboratoryTests.filter(
                (test) =>
                    !test.status ||
                    test.status.toLowerCase() === "pending"
            ).length;

        const completed =
            laboratoryTests.filter(
                (test) =>
                    test.status?.toLowerCase() === "completed"
            ).length;

        return {
            total,
            pending,
            completed
        };

    }, [laboratoryTests]);


    // ==================================================
    // CREATE / UPDATE
    // ==================================================

    const handleSaveLaboratoryTest = async (
        laboratoryTest
    ) => {

        try {

            setActionLoading("save");

            if (editingTest) {

                await updateLaboratoryTest(
                    editingTest.test_id,
                    laboratoryTest
                );

                showToast(
                    "Laboratory test updated successfully!"
                );

            } else {

                await createLaboratoryTest(
                    laboratoryTest
                );

                showToast(
                    "Laboratory test requested successfully!"
                );

            }


            setShowForm(false);

            setEditingTest(null);

            await loadLaboratoryTests();

        } catch (err) {

            console.error(
                "Failed to save laboratory test:",
                err
            );

            showToast(
                err?.message ||
                "Failed to save laboratory test."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ==================================================
    // EDIT
    // ==================================================

    const handleEdit = (test) => {

        if (
            test.status?.toLowerCase() ===
            "completed"
        ) {

            showToast(
                "Completed laboratory tests cannot be edited."
            );

            return;

        }


        setEditingTest(test);

        setShowForm(true);

    };


    // ==================================================
    // DELETE
    // ==================================================

    const handleDelete = async (id) => {

        const confirmDelete = await confirmAction({
            title: "Delete laboratory test?",
            message: "Are you sure you want to delete this laboratory test? This action cannot be undone.",
            confirmText: "Delete test",
        });

        if (!confirmDelete) {

            return;

        }


        try {

            setActionLoading(`delete-${id}`);

            await deleteLaboratoryTest(id);

            await loadLaboratoryTests();

            showToast(
                "Laboratory test deleted successfully!"
            );

        } catch (err) {

            console.error(
                "Failed to delete laboratory test:",
                err
            );

            showToast(
                err?.message ||
                "Failed to delete laboratory test."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ==================================================
    // COMPLETE
    // ==================================================

    const handleComplete = async (id) => {

        const result =
            window.prompt(
                "Enter laboratory test result:"
            );

        if (
            result === null ||
            !result.trim()
        ) {

            return;

        }


        try {

            setActionLoading(`complete-${id}`);

            await completeLaboratoryTest(
                id,
                result.trim()
            );

            await loadLaboratoryTests();

            showToast(
                "Laboratory test completed successfully!"
            );

        } catch (err) {

            console.error(
                "Failed to complete laboratory test:",
                err
            );

            showToast(
                err?.message ||
                "Failed to complete laboratory test."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // ==================================================
    // CANCEL FORM
    // ==================================================

    const handleCancel = () => {

        setShowForm(false);

        setEditingTest(null);

    };


    // ==================================================
    // STATUS
    // ==================================================

    const getStatusClass = (status) => {

        if (!status) {

            return "pending";

        }

        return status
            .toLowerCase()
            .replace(/\s+/g, "-");

    };


    const getStatusIcon = (status) => {

        const normalizedStatus =
            status?.toLowerCase();


        if (normalizedStatus === "completed") {

            return (
                <CheckCircle2
                    size={14}
                />
            );

        }


        if (normalizedStatus === "cancelled") {

            return (
                <AlertCircle
                    size={14}
                />
            );

        }


        return (
            <Clock3
                size={14}
            />
        );

    };


    // ==================================================
    // DATE FORMAT
    // ==================================================

    const formatDateTime = (date) => {

        if (!date) {

            return "—";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "—";

        }


        return parsedDate.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="hms-page page-container laboratory-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="laboratory-header">

                <div className="laboratory-header-content">

                    <div className="laboratory-title-row">

                        <div className="laboratory-title-icon">

                            <FlaskConical
                                size={22}
                            />

                        </div>

                        <h1 className="laboratory-title">
                            Laboratory
                        </h1>

                    </div>


                    <p className="laboratory-subtitle">

                        Manage laboratory requests,
                        investigations and patient results.

                    </p>

                </div>


                <button
                    className="laboratory-add-btn"
                    onClick={() => {

                        setEditingTest(null);

                        setShowForm(true);

                    }}
                    disabled={actionLoading === "save"}
                >

                    <Plus
                        size={18}
                    />

                    Request Test

                </button>

            </div>


            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            {!loading && (

                <div className="laboratory-summary">


                    {/* TOTAL */}

                    <div className="laboratory-summary-card">

                        <div className="laboratory-summary-icon total">

                            <TestTube2
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Total Tests
                            </span>

                            <strong>
                                {summary.total}
                            </strong>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="laboratory-summary-card">

                        <div className="laboratory-summary-icon pending">

                            <Clock3
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {summary.pending}
                            </strong>

                        </div>

                    </div>


                    {/* COMPLETED */}

                    <div className="laboratory-summary-card">

                        <div className="laboratory-summary-icon completed">

                            <CheckCircle2
                                size={20}
                            />

                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {summary.completed}
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================================
                FORM
            ========================================== */}

            {showForm && (

                <AddLaboratoryForm

                    laboratoryTest={
                        editingTest
                    }

                    onSave={
                        handleSaveLaboratoryTest
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

                <div className="laboratory-loading">

                    <div className="laboratory-spinner"></div>

                    <p>
                        Loading laboratory tests...
                    </p>

                </div>

            ) : (


                /* ======================================
                   TABLE
                ====================================== */

                <div className="laboratory-table-wrapper">

                    <table className="laboratory-table">

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Patient
                                </th>

                                <th>
                                    Doctor
                                </th>

                                <th>
                                    Test
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Result
                                </th>

                                <th>
                                    Requested
                                </th>

                                <th>
                                    Completed
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {laboratoryTests.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="laboratory-empty"
                                    >

                                        <div className="laboratory-empty-icon">

                                            <FlaskConical
                                                size={32}
                                            />

                                        </div>

                                        <strong>
                                            No laboratory tests yet
                                        </strong>

                                        <span>
                                            Laboratory requests will
                                            appear here.
                                        </span>

                                        <button
                                            className="laboratory-empty-btn"
                                            onClick={() => {

                                                setEditingTest(null);

                                                setShowForm(true);

                                            }}
                                        >

                                            <Plus
                                                size={16}
                                            />

                                            Request First Test

                                        </button>

                                    </td>

                                </tr>

                            ) : (

                                laboratoryTests.map(
                                    (test) => {

                                        const isCompleted =
                                            test.status?.toLowerCase() ===
                                            "completed";

                                        const isDeleting =
                                            actionLoading ===
                                            `delete-${test.test_id}`;

                                        const isCompleting =
                                            actionLoading ===
                                            `complete-${test.test_id}`;


                                        return (

                                            <tr
                                                key={
                                                    test.test_id !== undefined &&
                                                    test.test_id !== null
                                                        ? `laboratory-test-${test.test_id}`
                                                        : `laboratory-local-${test.id ?? "unknown"}`
                                                }
                                            >


                                                {/* ID */}

                                                <td className="laboratory-test-id">

                                                    {formatLaboratoryId(test.test_id)}

                                                </td>


                                                {/* PATIENT */}

                                                <td>

                                                    <div className="laboratory-patient">

                                                        <strong>

                                                            {
                                                                test.patient_name ||
                                                                "Unknown Patient"
                                                            }

                                                        </strong>

                                                        <small>

                                                            Patient #
                                                            {
                                                                test.patient_id
                                                            }

                                                        </small>

                                                    </div>

                                                </td>


                                                {/* DOCTOR */}

                                                <td>

                                                    <div className="laboratory-doctor">

                                                        <strong>

                                                            {
                                                                test.doctor_name ||
                                                                "Unknown Doctor"
                                                            }

                                                        </strong>

                                                        {test.doctor_specialization && (

                                                            <small>

                                                                {
                                                                    test.doctor_specialization
                                                                }

                                                            </small>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* TEST */}

                                                <td className="laboratory-test-name">

                                                    <div className="laboratory-test-name-content">

                                                        <TestTube2
                                                            size={16}
                                                        />

                                                        <span>

                                                            {
                                                                test.test_name ||
                                                                "Unnamed Test"
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `laboratory-status ${getStatusClass(
                                                                test.status
                                                            )}`
                                                        }
                                                    >

                                                        {
                                                            getStatusIcon(
                                                                test.status
                                                            )
                                                        }

                                                        {
                                                            test.status ||
                                                            "Pending"
                                                        }

                                                    </span>

                                                </td>


                                                {/* RESULT */}

                                                <td>

                                                    {test.result ? (

                                                        <div className="laboratory-result">

                                                            {test.result}

                                                        </div>

                                                    ) : (

                                                        <span className="laboratory-result pending">

                                                            Awaiting result

                                                        </span>

                                                    )}

                                                </td>


                                                {/* REQUESTED */}

                                                <td className="laboratory-date">

                                                    {
                                                        formatDateTime(
                                                            test.requested_at
                                                        )
                                                    }

                                                </td>


                                                {/* COMPLETED */}

                                                <td className="laboratory-date">

                                                    {
                                                        formatDateTime(
                                                            test.completed_at
                                                        )
                                                    }

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="laboratory-actions">


                                                        {/* EDIT */}

                                                        <button
                                                            className="laboratory-action-btn laboratory-edit-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    test
                                                                )
                                                            }
                                                            disabled={
                                                                isCompleted ||
                                                                actionLoading !== null
                                                            }
                                                            title={
                                                                isCompleted
                                                                    ? "Completed tests cannot be edited"
                                                                    : "Edit laboratory test"
                                                            }
                                                        >

                                                            <Pencil
                                                                size={14}
                                                            />

                                                            Edit

                                                        </button>


                                                        {/* COMPLETE */}

                                                        {!isCompleted && (

                                                            <button
                                                                className="laboratory-action-btn laboratory-complete-btn"
                                                                onClick={() =>
                                                                    handleComplete(
                                                                        test.test_id
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading !== null
                                                                }
                                                                title="Complete laboratory test"
                                                            >

                                                                <CheckCircle2
                                                                    size={14}
                                                                />

                                                                {isCompleting
                                                                    ? "Saving..."
                                                                    : "Complete"}

                                                            </button>

                                                        )}


                                                        {/* DELETE */}

                                                        <button
                                                            className="laboratory-action-btn laboratory-delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    test.test_id
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading !== null
                                                            }
                                                            title="Delete laboratory test"
                                                        >

                                                            <Trash2
                                                                size={14}
                                                            />

                                                            {isDeleting
                                                                ? "Deleting..."
                                                                : "Delete"}

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


export default Laboratory;