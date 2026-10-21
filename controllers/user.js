
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const verifyUserPassword = require("../utils/verifyUserPassword");
const hashPassword = require("../utils/hashPassword");
const startUserSession = require("../utils/startUserSession");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = wrapAsync(async (req, res) => {
    const { username, email, password } = req.body;

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        password.length < 8
    ) {
        throw new ExpressError(
            400,
            "Username, email, and a password of at least 8 characters are required"
        );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
    });

    try {
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) {
            throw new ExpressError(
                409,
                "Username or email already exists"
            );
        }

        throw err;
    }

    const redirectUrl = req.session.returnTo || "/listings";
    await startUserSession(req, newUser._id);
    req.session.success = "Your account is ready. Welcome!";
    res.redirect(redirectUrl);
});

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = wrapAsync(async (req, res) => {
    const identifier = req.body.username || req.body.email;
    const { password } = req.body;

    if (
        typeof identifier !== "string" ||
        !identifier.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new ExpressError(400, "Username or email and password are required");
    }

    const normalizedIdentifier = identifier.trim();
    const user = await User.findOne({
        $or: [
            { username: normalizedIdentifier },
            { email: normalizedIdentifier.toLowerCase() }
        ]
    });

    if (!user) {
        throw new ExpressError(401, "Invalid username/email or password");
    }

    if (!await verifyUserPassword(user, password)) {
        throw new ExpressError(401, "Invalid username/email or password");
    }

    const redirectUrl = req.session.returnTo || "/listings";
    await startUserSession(req, user._id);
    res.redirect(redirectUrl);
});

module.exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(
                new ExpressError(500, "Could not log out")
            );
        }

        res.redirect("/listings");
    });
};

module.exports.becomeHost = wrapAsync(async (req, res) => {
    const user = await User.findById(req.session.userId);

    if (!user) {
        throw new ExpressError(404, "User Not Found");
    }

    if (user.role === "host") {
        throw new ExpressError(400, "You are already a host");
    }

    if (user.hostRequestStatus === "pending") {
        throw new ExpressError(
            400,
            "Your host request is already pending"
        );
    }

    user.hostRequestStatus = "pending";

    await user.save();
    req.session.success = "Your host request was submitted for admin approval.";

    res.redirect("/listings");
});
