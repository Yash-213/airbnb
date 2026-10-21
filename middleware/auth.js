
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.session.error = "Please log in to continue";
        return res.redirect("/login");
    }
    next();
};

const isOwner = wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    if (
        !listing.owner ||
        !listing.owner.equals(req.session.userId)
    ) {
        throw new ExpressError(
            403,
            "You don't have permission to modify this listing"
        );
    }

    next();
});

const isHost = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.session.error = "Please log in to continue";
        return res.redirect("/login");
    }

    if (!res.locals.currentUser ||
        res.locals.currentUser.role !== "host") {
        throw new ExpressError(
            403,
            "Only hosts can access this page"
        );
    }

    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.session.error = "Please log in to continue";
        return res.redirect("/login");
    }

    if (!res.locals.currentUser ||
        res.locals.currentUser.role !== "admin") {
        throw new ExpressError(
            403,
            "Only admins can access this page"
        );
    }

    next();
};

const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review Not Found");
    }

    if (String(review.listing) !== req.params.id) {
        throw new ExpressError(404, "Review Not Found");
    }

    if (!review.author || !review.author.equals(req.session.userId)) {
        throw new ExpressError(
            403,
            "You don't have permission to modify this review"
        );
    }

    next();
});

module.exports = {
    isLoggedIn,
    isOwner,
    isHost,
    isAdmin,
    isReviewAuthor
};
