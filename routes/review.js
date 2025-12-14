const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//POST Route
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        let listing = await Listing.findById(id);
        if (!listing) {
            return next(new ExpressError(404, "Listing not found"));
        }
        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("seccess", "New Review created!!");
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash("seccess", "Review Deleted!!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;