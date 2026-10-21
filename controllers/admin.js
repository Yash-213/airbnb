
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

module.exports.hostRequests = wrapAsync(async (req, res) => {
    const users = await User.find({
        hostRequestStatus: "pending"
    });

    res.render("admin/host-requests.ejs", { users });
});

module.exports.approveHost = wrapAsync(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ExpressError(404, "User Not Found");
    }

    if (user.hostRequestStatus !== "pending") {
        throw new ExpressError(400, "No pending host request");
    }

    user.role = "host";
    user.hostRequestStatus = "none";

    await user.save();

    req.session.success =
        `${user.username} has been approved as a host.`;

    res.redirect("/admin/host-requests");
});

module.exports.rejectHost = wrapAsync(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ExpressError(404, "User Not Found");
    }

    if (user.hostRequestStatus !== "pending") {
        throw new ExpressError(400, "No pending host request");
    }

    user.hostRequestStatus = "rejected";

    await user.save();

    req.session.success =
        `${user.username}'s host request has been rejected.`;

    res.redirect("/admin/host-requests");
});
