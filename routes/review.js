const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const Review = require("../models/review");

const validateReview = (req, res, next) => {
    let {err} = reviewSchema.validate(req.body); 
    if (err) {
        let errMsg = err.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

//POST Route
router.post("/", validateReview, wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            return next(new ExpressError(404, "Listing not found"));
        }
        const newReview = new Review(req.body.review);
        await newReview.save();
        listing.reviews.push(newReview._id);
        await listing.save();
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
router.delete("/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;