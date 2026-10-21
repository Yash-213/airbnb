
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const parseDateOnly = require("../utils/parseDateOnly");

function redirectWithBookingError(req, res, listingId, message) {
    req.session.error = message;
    const destination = mongoose.Types.ObjectId.isValid(listingId)
        ? `/listings/${listingId}`
        : "/listings";
    res.redirect(destination);
}

module.exports.redirectWithBookingError = redirectWithBookingError;

module.exports.create = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return redirectWithBookingError(req, res, id, "This listing could not be found.");
    }

    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
        return redirectWithBookingError(req, res, id, "Choose at least one guest.");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return redirectWithBookingError(req, res, id, "This listing could not be found.");
    }

    if (listing.owner && listing.owner.equals(req.session.userId)) {
        return redirectWithBookingError(req, res, id, "You cannot book your own listing.");
    }

    const maxGuests = listing.maxGuests || 2;
    if (guestCount > maxGuests) {
        return redirectWithBookingError(
            req,
            res,
            id,
            `This listing allows a maximum of ${maxGuests} guests.`
        );
    }

    const startDate = parseDateOnly(checkIn);
    const endDate = parseDateOnly(checkOut);

    if (!startDate || !endDate) {
        return redirectWithBookingError(req, res, id, "Please choose valid check-in and check-out dates.");
    }

    if (endDate <= startDate) {
        return redirectWithBookingError(req, res, id, "Check-out must be after check-in.");
    }

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    if (checkIn < today) {
        return redirectWithBookingError(req, res, id, "Check-in date cannot be in the past.");
    }

    const existingBooking = await Booking.findOne({
        listing: id,
        status: "confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate }
    });

    if (existingBooking) {
        return redirectWithBookingError(
            req,
            res,
            id,
            "Those dates are no longer available. Choose another date range."
        );
    }

    const numberOfNights =
        (endDate - startDate) / (1000 * 60 * 60 * 24);

    const totalPrice = numberOfNights * listing.price;

    const booking = new Booking({
        user: req.session.userId,
        listing: id,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        totalPrice
    });

    await booking.save();

    req.session.success = "Booking confirmed successfully!";

    res.redirect("/bookings");
});

module.exports.checkAvailability = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const startDate = parseDateOnly(checkIn);
    const endDate = parseDateOnly(checkOut);

    if (!startDate || !endDate || endDate <= startDate) {
        throw new ExpressError(400, "Invalid booking dates");
    }

    const existingBooking = await Booking.findOne({
        listing: id,
        status: "confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate }
    });

    res.json({ available: !existingBooking });
});

module.exports.guestBookings = wrapAsync(async (req, res) => {
    const bookings = await Booking.find({
        user: req.session.userId
    }).populate("listing");

    res.render("bookings/index.ejs", { bookings });
});

module.exports.hostBookings = wrapAsync(async (req, res) => {
    const listings = await Listing.find({
        owner: req.session.userId
    });

    const listingIds = listings.map(listing => listing._id);

    const bookings = await Booking.find({
        listing: { $in: listingIds }
    }).populate("listing").populate("user");

    bookings.sort((a, b) => {
        if (a.status === b.status) {
            return a.checkIn - b.checkIn;
        }

        return a.status === "confirmed" ? -1 : 1;
    });

    res.render("bookings/host.ejs", { bookings });
});

module.exports.cancel = wrapAsync(async (req, res) => {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new ExpressError(404, "Booking Not Found");
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new ExpressError(404, "Booking Not Found");
    }

    if (!booking.user.equals(req.session.userId)) {
        throw new ExpressError(
            403,
            "You don't have permission to cancel this booking"
        );
    }

    if (booking.status === "cancelled") {
        throw new ExpressError(400, "Booking is already cancelled");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (booking.checkIn <= today) {
        throw new ExpressError(
            400,
            "You cannot cancel a booking after check-in"
        );
    }

    booking.status = "cancelled";
    await booking.save();

    res.redirect("/bookings");
});
