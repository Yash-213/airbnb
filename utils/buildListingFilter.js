const escapeRegex = require("./escapeRegex");

module.exports = ({ q, country }) => {
    const filter = {};

    if (typeof q === "string" && q.trim()) {
        filter.title = {
            $regex: escapeRegex(q.trim()),
            $options: "i"
        };
    }

    if (typeof country === "string" && country.trim()) {
        filter.country = {
            $regex: escapeRegex(country.trim()),
            $options: "i"
        };
    }

    return filter;
};
