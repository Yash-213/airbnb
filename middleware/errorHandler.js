
const ExpressError = require("../utils/ExpressError");

const notFound = (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
};

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status;
    let message = err.message || "Something went wrong";

    if (err.name === "ValidationError" || err.name === "CastError") {
        statusCode = 400;
    } else if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        message = "The uploaded image must be 5 MB or smaller";
    } else if (err.code === 11000) {
        statusCode = 409;
        message = "A record with that value already exists";
    } else if (!statusCode || statusCode < 400 || statusCode > 599) {
        statusCode = 500;
        message = "Something went wrong";
    }

    console.error(err);

    res.status(statusCode).render("error.ejs", {
        err: { ...err, statusCode, message }
    });
};

module.exports = {
    notFound,
    errorHandler
};
