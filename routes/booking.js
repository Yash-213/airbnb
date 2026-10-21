
const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking");
const { isLoggedIn, isHost } = require("../middleware/auth");

router.get(
    "/bookings",
    isLoggedIn,
    bookingController.guestBookings
);

router.get(
    "/host/bookings",
    isHost,
    bookingController.hostBookings
);

router.post(
    "/listings/:id/bookings",
    isLoggedIn,
    bookingController.create
);

router.post(
    "/bookings/:bookingId/cancel",
    isLoggedIn,
    bookingController.cancel
);

module.exports = router;
