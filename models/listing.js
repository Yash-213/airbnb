const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

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
            type: String
        },
        url: {
            type: String
        }
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    maxGuests: {
        type: Number,
        min: 1,
        default: 2,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({
            $or: [
                { _id: { $in: listing.reviews } },
                { listing: listing._id }
            ]
        });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
