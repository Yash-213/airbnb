const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");

const validateListing = (req, res, next) => {
    let {err} = listingSchema.validate(req.body); 
    if (err) {
        let errMsg = err.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing });
}));

// New Route
router.get("/new", (req, res) => {
    res.render("listings/new");
});

// Create Listing
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("seccess", "New Listing created!!");
    res.redirect("/listings");
}));

// Show Data
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing Does not exist!!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}));

// Edit Form
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing Does not exist!!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
}));

// Update Listing
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("seccess", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("seccess", "Listing Deleted!!");
    res.redirect("/listings");
}));

module.exports = router;