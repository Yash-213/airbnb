const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

main()
    .then(() => {
        console.log('Connected!');
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)

app.get("/", (req, res) => {
    res.send("Hello World");
});
// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing }); 
}));

//New Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new");
});

//Create Listing
app.post("/listings", wrapAsync(async(req, res, next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
}));

//Show Data
app.get("/listings/:id", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }
    res.render("listings/show",{listing});
}));

//Update Data
app.get("/listings/:id/edit", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }
    res.render("listings/edit", {listing});
}));

app.put("/listings/:id", wrapAsync(async(req,res, next)=>{
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        return next(new ExpressError(404, "Listing not found!"));
    }
    console.log(deletedListing);
    res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error", { message });
});

const port = 5000;
app.listen(port, () => {
    console.log("Connected to port 5000...");
});
