const bcrypt = require("bcrypt");

module.exports = async (user, password) => {
    if (user.password) {
        return bcrypt.compare(password, user.password);
    }

    if (typeof user.authenticate === "function") {
        const authentication = await user.authenticate(password);
        return Boolean(authentication.user);
    }

    return false;
};
