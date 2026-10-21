
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");

const loadCurrentUser = wrapAsync(async (req, res, next) => {
    if (req.session.userId) {
        res.locals.currentUser = await User.findById(
            req.session.userId
        );
    } else {
        res.locals.currentUser = null;
    }

    res.locals.currUser = res.locals.currentUser;
    next();
});

const loadFlashMessages = (req, res, next) => {
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;
    delete req.session.success;
    delete req.session.error;
    next();
};

module.exports = {
    loadCurrentUser,
    loadFlashMessages
};
