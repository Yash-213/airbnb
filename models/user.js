const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose =
    require("passport-local-mongoose").default ||
    require("passport-local-mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["guest", "host", "admin"],
        default: "guest"
    },
    hostRequestStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none"
    }
});

userSchema.plugin(passportLocalMongoose, {
    usernameField: "username",
    usernameUnique: false
});

module.exports = mongoose.model("User", userSchema);
