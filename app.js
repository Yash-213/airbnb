const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing");
const reviews = require("./routes/review");

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

//listings Route
app.use("/listings", listings);

// Review Route
app.use("/listings/:id/reviews", reviews);

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
