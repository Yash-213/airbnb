const User = require("../models/user");
const hashPassword = require("./hashPassword");

module.exports = async () => {
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!username && !email && !password) {
        return;
    }

    if (!username || !email || !password) {
        throw new Error(
            "Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD together to configure an admin"
        );
    }

    let admin = await User.findOne({ username: username.trim() });
    if (!admin) {
        admin = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: await hashPassword(password),
            role: "admin"
        });
    } else {
        admin.role = "admin";
    }

    await admin.save();
};
