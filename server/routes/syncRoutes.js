const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
    addToSyncQueue,
    getPendingSync,
    markAsSynced
} = require("../controllers/syncController");

// View pending sync queue
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getPendingSync
);

// Add operation to queue
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    addToSyncQueue
);

// Mark operation as synchronized
router.patch(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    markAsSynced
);

module.exports = router;