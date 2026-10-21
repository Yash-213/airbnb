const auth = require("./middleware/auth");
const validateListing = require("./middleware/validateListing");
const { reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        throw new ExpressError(
            400,
            error.details.map(detail => detail.message).join(", ")
        );
    }

    next();
};

module.exports = {
    ...auth,
    validateListing,
    validateReview,
    saveRedirectUrl: (req, res, next) => {
        if (req.session.returnTo) {
            res.locals.redirectUrl = req.session.returnTo;
        }
        next();
    }
};
