
const Listing = require("../models/listing");
const mongoose = require("mongoose");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

module.exports.create = wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const { rating, comment } = req.body.review || {};
    const numericRating = Number(rating);

    if (
        rating === undefined ||
        rating === "" ||
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        throw new ExpressError(
            400,
            "Rating must be between 1 and 5"
        );
    }

    if (typeof comment !== "string" || !comment.trim()) {
        throw new ExpressError(400, "Comment is required");
    }

    const existingReview = await Review.findOne({
        listing: id,
        author: req.session.userId
    });

    if (existingReview) {
        throw new ExpressError(
            400,
            "You have already reviewed this listing"
        );
    }

    const review = new Review({
        rating: numericRating,
        comment: comment.trim(),
        author: req.session.userId,
        listing: id
    });

    await review.save();
    listing.reviews.push(review._id);
    await listing.save();

    res.redirect(`/listings/${id}`);
});

module.exports.destroy = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ExpressError(404, "Review Not Found");
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        throw new ExpressError(404, "Review Not Found");
    }

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: review._id }
    });

    res.redirect(`/listings/${id}`);
});
