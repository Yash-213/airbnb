const joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        description: joi.string().required(),
        country : joi.string().required(),
        location: joi.string().required(),
        ImageURL: joi.string().allow("null","")
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(0).max(5),
        comment: joi.string().required()
    }).required()
})