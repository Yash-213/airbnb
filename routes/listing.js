
const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listing");
const validateListing = require("../middleware/validateListing");
const { isLoggedIn, isHost, isOwner } = require("../middleware/auth");
const multer = require("multer");
const { storage, cloudUpload } = require("../cloudConfig");
const ExpressError = require("../utils/ExpressError");

const bookingController = require("../controllers/booking");
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new ExpressError(400, "Only image uploads are allowed"));
        }
        callback(null, true);
    }
});

router.get("/listings", listingController.index);

router.get(
    "/listings/new",
    isHost,
    listingController.renderNewForm
);

router.post(
    "/listings",
    isHost,
    upload.single("listing[image][url]"),
    cloudUpload,
    validateListing,
    listingController.create
);

router.get(
    "/host/listings",
    isHost,
    listingController.hostListings
);

router.get(
    "/listings/:id/edit",
    isLoggedIn,
    isOwner,
    listingController.renderEditForm
);

router.put(
    ["/listings/:id", "/listings/:id/update"],
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    cloudUpload,
    validateListing,
    listingController.update
);

router.delete(
    ["/listings/:id", "/listings/:id/delete"],
    isLoggedIn,
    isOwner,
    listingController.destroy
);

router.get(
    "/listings/:id/availability",
    bookingController.checkAvailability
);

router.get("/listings/:id", listingController.show);

module.exports = router;
