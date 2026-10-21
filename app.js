
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const routes = require("./routes");
const bootstrapAdmin = require("./utils/bootstrapAdmin");
const {
    loadCurrentUser,
    loadFlashMessages
} = require("./middleware/locals");

const {
    notFound,
    errorHandler
} = require("./middleware/errorHandler");

const app = express();

const mongoURL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/airbnb";
const sessionSecret = process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production"
        ? null
        : "local-development-session-secret");
const port = process.env.PORT || 5000;

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Core middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

if (sessionSecret) {
    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false
    }));
}

// Shared EJS locals
app.use(loadCurrentUser);
app.use(loadFlashMessages);

// Application routes
app.use("/", routes);

// 404 handler must come after all routes
app.use(notFound);

// Error handler must be last
app.use(errorHandler);

const startServer = async () => {
    if (!sessionSecret) {
        throw new Error("SESSION_SECRET must be configured before starting the server");
    }

    await mongoose.connect(mongoURL);
    await bootstrapAdmin();
    app.listen(port, "127.0.0.1", () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

if (require.main === module) {
    startServer().catch(error => {
        console.error("Could not start the server:", error);
        process.exitCode = 1;
    });
}

module.exports = app;
