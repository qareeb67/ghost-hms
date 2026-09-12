
// ==================================================
// HOSPITAL MANAGEMENT SYSTEM — PERMISSION MIDDLEWARE
// ==================================================
//
// Purpose:
// Fine-grained authorization for hospital operations.
//
// Authentication tells us WHO the user is.
// Permissions tell us WHAT that user can do.
//
// Example:
//
// authenticateToken
//        ↓
// req.user
//        ↓
// requirePermission("billing.create")
//        ↓
// Controller
//
// ==================================================


// ==================================================
// ROLE → PERMISSIONS
// ==================================================

const ROLE_PERMISSIONS = {

    // ==================================================
    // ADMIN
    // ==================================================

    admin: [

        // Users
        "users.view",
        "users.create",
        "users.update",
        "users.delete",

        // Patients
        "patients.view",
        "patients.create",
        "patients.update",
        "patients.delete",

        // Doctors
        "doctors.view",
        "doctors.create",
        "doctors.update",
        "doctors.delete",

        // Appointments
        "appointments.view",
        "appointments.create",
        "appointments.update",
        "appointments.delete",

        // Medicines
        "medicines.view",
        "medicines.create",
        "medicines.update",
        "medicines.delete",

        // Billing
        "billing.view",
        "billing.create",
        "billing.update",
        "billing.delete",

        // Payments
        "payments.view",
        "payments.record",
        "payments.reverse",

        // Financial
        "financial.view",
        "financial.reconcile",

        // Money movement
        "withdrawal.view",
        "withdrawal.request",
        "withdrawal.approve",
        "withdrawal.execute"

    ],


    // ==================================================
    // DOCTOR
    // ==================================================

    doctor: [

        "patients.view",
        "patients.create",
        "patients.update",

        "doctors.view",

        "appointments.view",
        "appointments.create",
        "appointments.update",

        "medicines.view",

        "billing.view"

    ],


    // ==================================================
    // NURSE
    // ==================================================

    nurse: [

        "patients.view",
        "patients.update",

        "doctors.view",

        "appointments.view",

        "medicines.view"

    ],


    // ==================================================
    // RECEPTIONIST
    // ==================================================

    receptionist: [

        "patients.view",
        "patients.create",
        "patients.update",

        "doctors.view",

        "appointments.view",
        "appointments.create",
        "appointments.update",

        "billing.view",
        "billing.create"

    ],


    // ==================================================
    // CASHIER
    // ==================================================
    //
    // IMPORTANT:
    // A cashier can collect/record payments.
    //
    // A cashier CANNOT:
    // - delete bills
    // - alter historical bills
    // - approve withdrawals
    // - execute withdrawals
    // - reconcile the hospital ledger
    //
    // ==================================================

    cashier: [

        "patients.view",

        "billing.view",
        "billing.create",

        "payments.view",
        "payments.record"

    ],


    // ==================================================
    // ACCOUNTANT
    // ==================================================

    accountant: [

        "billing.view",

        "payments.view",

        "financial.view",
        "financial.reconcile",

        "withdrawal.view",
        "withdrawal.request"

    ],


    // ==================================================
    // PHARMACIST
    // ==================================================

    pharmacist: [

        "patients.view",

        "medicines.view",
        "medicines.create",
        "medicines.update",

        "billing.view"

    ],


    // ==================================================
    // LAB TECHNICIAN
    // ==================================================

    lab_technician: [

        "patients.view",

        "doctors.view",

        "appointments.view"

    ],


    // ==================================================
    // GENERAL STAFF
    // ==================================================

    staff: [

        "patients.view",

        "doctors.view",

        "appointments.view",

        "medicines.view",

        "billing.view"

    ]

};


// ==================================================
// REQUIRE PERMISSION
// ==================================================

const requirePermission = (permission) => {

    return (req, res, next) => {

        // ------------------------------------------
        // AUTHENTICATION CHECK
        // ------------------------------------------

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        // ------------------------------------------
        // GET USER ROLE
        // ------------------------------------------

        const role = req.user.role;


        // ------------------------------------------
        // CHECK ROLE EXISTS
        // ------------------------------------------

        if (!ROLE_PERMISSIONS[role]) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. Unknown user role."

            });

        }


        // ------------------------------------------
        // GET PERMISSIONS
        // ------------------------------------------

        const permissions =
            ROLE_PERMISSIONS[role];


        // ------------------------------------------
        // CHECK PERMISSION
        // ------------------------------------------

        if (!permissions.includes(permission)) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. You do not have permission to perform this action."

            });

        }


        // ------------------------------------------
        // ALLOWED
        // ------------------------------------------

        next();

    };

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
    ROLE_PERMISSIONS,
    requirePermission
};

