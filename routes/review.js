
const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review");
const { isLoggedIn, isReviewAuthor } = require("../middleware/auth");
const { validateReview } = require("../middleware");

router.post(
    "/listings/:id/reviews",
    isLoggedIn,
    validateReview,
    reviewController.create
);

router.delete(
    "/listings/:id/reviews/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    reviewController.destroy
);

module.exports = router;
