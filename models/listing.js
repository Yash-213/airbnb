const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        filename: {
            type: String,
        },
        url: {
            type: String,
            default: "https://unsplash.com/photos/a-white-house-with-a-porch-and-trees-tOAooVhQQzk",
            set: (v) => !v ? "https://unsplash.com/photos/a-white-house-with-a-porch-and-trees-tOAooVhQQzk" : v
        }
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
