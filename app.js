
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
  loadFlashMessages,
} = require("./middleware/locals");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

// Environment variables
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/airbnb";

const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? null
    : "local-development-session-secret");

const port = process.env.PORT || 5000;

// Safe deployment diagnostics (never print credentials)
console.log("MongoDB URI configured:", Boolean(process.env.MONGO_URI));
console.log(
  "MongoDB target:",
  process.env.MONGO_URI ? "Configured URI" : "LOCALHOST FALLBACK"
);

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Core middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET must be configured before starting the server"
  );
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Shared EJS locals
app.use(loadCurrentUser);
app.use(loadFlashMessages);

// Application routes
app.use("/", routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    await bootstrapAdmin();

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Could not start the server:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
