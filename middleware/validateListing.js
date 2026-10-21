
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, {
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

module.exports = validateListing;
