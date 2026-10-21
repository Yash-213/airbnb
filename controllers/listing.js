
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const buildListingFilter = require("../utils/buildListingFilter");

module.exports.index = wrapAsync(async (req, res) => {
    const { q, country, sort } = req.query;
    let query = Listing.find(buildListingFilter({ q, country }));

    if (sort === "price-asc") {
        query = query.sort({ price: 1 });
    }

    if (sort === "price-desc") {
        query = query.sort({ price: -1 });
    }

    const listings = await query;
    const countries = (await Listing.distinct("country"))
        .filter(value => typeof value === "string" && value.trim())
        .sort((first, second) => first.localeCompare(second));

    res.render("listings/index.ejs", {
        listings,
        q: typeof q === "string" ? q : "",
        country: typeof country === "string" ? country : "",
        sort,
        countries
    });
});

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.create = wrapAsync(async (req, res) => {
    if (!req.file) {
        throw new ExpressError(400, "Please upload a listing image");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.session.userId;
    newListing.image = {
        filename: req.file.filename,
        url: req.file.path
    };

    await newListing.save();

    res.redirect("/listings");
});

module.exports.renderEditForm = wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    res.render("listings/edit.ejs", { listing });
});

module.exports.update = wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findByIdAndUpdate(
        id,
        {
            ...req.body.listing,
            ...(req.file && {
                image: {
                    filename: req.file.filename,
                    url: req.file.path
                }
            })
        },
        { new: true, runValidators: true }
    );

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    res.redirect(`/listings/${listing._id}`);
});

module.exports.destroy = wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const existingBooking = await Booking.findOne({
        listing: id
    });

    if (existingBooking) {
        throw new ExpressError(
            400,
            "You cannot delete a listing with booking history"
        );
    }

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    res.redirect("/listings");
});

module.exports.show = wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Listing Not Found");
    }

    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing Not Found");
    }

    await listing.populate({
        path: "reviews",
        populate: { path: "author" }
    });
    const reviews = listing.reviews.filter(Boolean);

    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0)
            / reviews.length
        : 0;

    const hasReviewed = req.session.userId
        ? reviews.some(review =>
            review.author &&
            review.author._id.equals(req.session.userId)
        )
        : false;

    res.render("listings/show.ejs", {
        listing,
        reviews,
        hasReviewed,
        averageRating
    });
});

module.exports.hostListings = wrapAsync(async (req, res) => {
    const listings = await Listing.find({
        owner: req.session.userId
    });

    res.render("listings/host.ejs", { listings });
});
