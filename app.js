const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
app.get("/listings", async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index", { allListing }); 
});

//New Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new");
});

//Create Listing
app.post("/listings", async(req, res)=>{
    const newListing = new Listing(req.body.listing);
    newListing.image.url = req.body.listing.image;
    await newListing.save();
    res.redirect("/listings")
});

//Show Data
app.get("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show",{listing});
});

//Update Data
app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", {listing});
})

app.put("/listings/:id", async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id", async(req, res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

// app.get("/testing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "Hello World",
//         description: "this is lovely house",
//         price: 5000,
//         location: "Nandani",
//         country: "India"
//     });
//     await sampleListing.save();
//     res.send("successfully saved");
// });

const port = 5000;
app.listen(port, () => {
    console.log("Connected to port 5000...");
});
