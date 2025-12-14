const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB connected!");

        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) => ({...obj, owner: "693e73f63a15f8b06ccc1519"}))
        await Listing.insertMany(initData.data);
        console.log("Data initialized.");

        await mongoose.disconnect(); 
        console.log("MongoDB disconnected.");
    } catch (err) {
        console.error("Error during DB initialization:", err);
    }
}

main();
