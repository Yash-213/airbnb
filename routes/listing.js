const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");

// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing });
}));

// New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// Create Listing
router.post("/", validateListing, isLoggedIn,wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("seccess", "New Listing created!!");
    res.redirect("/listings");
}));

// Show Data
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path :"reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing Does not exist!!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
}));

// Edit Form
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing Does not exist!!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
}));

// Update Listing
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("seccess", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("seccess", "Listing Deleted!!");
    res.redirect("/listings");
}));

module.exports = router;