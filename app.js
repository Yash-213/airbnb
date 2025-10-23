const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");
const Review = require("./models/review");

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

const validateListing = (req, res, next) => {
    let {err} = listingSchema.validate(req.body); 
    if (err) {
        let errMsg = err.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let {err} = reviewSchema.validate(req.body); 
    if (err) {
        let errMsg = err.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
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
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show Data
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show", { listing });
}));

// Edit Form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

// Update Listing
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
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

// Review Route
//POST Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
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
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

// ---------- Handle Unmatched Routes ----------
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// ---------- Central Error Handler ----------
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error", { err });
});

// ---------- Server ----------
const port = 5000;
app.listen(port, () => {
    console.log(`Connected to port ${port}...`);
});
