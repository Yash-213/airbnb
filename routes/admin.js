const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const { isAdmin } = require("../middleware/auth");

router.get(
    "/admin/host-requests",
    isAdmin,
    adminController.hostRequests
);

router.post(
    "/admin/host-requests/:userId/approve",
    isAdmin,
    adminController.approveHost
);

router.post(
    "/admin/host-requests/:userId/reject",
    isAdmin,
    adminController.rejectHost
);

module.exports = router;
