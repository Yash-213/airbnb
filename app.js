const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

main()
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

// ---------- Setup ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ---------- Routes ----------

// Home
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing });
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Create Listing
app.post("/listings", wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show Data
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
}));

// Edit Form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

// Update Listing
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// ---------- Server ----------
const port = 5000;
app.listen(port, () => {
    console.log(`Connected to port ${port}...`);
});
