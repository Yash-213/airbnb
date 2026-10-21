const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const { listingSchema, reviewSchema } = require("../schema");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const parseDateOnly = require("../utils/parseDateOnly");
const verifyUserPassword = require("../utils/verifyUserPassword");
const buildListingFilter = require("../utils/buildListingFilter");
const hashPassword = require("../utils/hashPassword");
const startUserSession = require("../utils/startUserSession");
const bookingController = require("../controllers/booking");

test("listing validation accepts listing fields without an uploaded file in the body", () => {
    const { error } = listingSchema.validate({
        listing: {
            title: "Cozy stay",
            price: "125",
            description: "A comfortable place to stay",
            country: "India",
            location: "Pune",
            maxGuests: "3"
        }
    });

    assert.equal(error, undefined);
});

test("listing validation rejects attempts to update protected fields", () => {
    const { error } = listingSchema.validate({
        listing: {
            title: "Cozy stay",
            price: 125,
            description: "A comfortable place to stay",
            country: "India",
            location: "Pune",
            owner: "attacker"
        }
    });
    assert.ok(error);
});

test("listing filters match country names case-insensitively and escape regex input", () => {
    const filter = buildListingFilter({
        q: "  beach ",
        country: "  united states "
    });

    assert.equal(filter.title.$options, "i");
    assert.equal(new RegExp(filter.title.$regex, filter.title.$options).test("Beach house"), true);
    assert.equal(filter.country.$options, "i");
    assert.equal(new RegExp(filter.country.$regex, filter.country.$options).test("United States"), true);

    const literal = buildListingFilter({ country: ".*" }).country;
    assert.equal(new RegExp(literal.$regex, literal.$options).test("Anything"), false);
    assert.equal(new RegExp(literal.$regex, literal.$options).test(".*"), true);
});

test("review validation requires a rating between one and five", () => {
    assert.equal(
        reviewSchema.validate({
            review: { rating: 5, comment: "Great stay" }
        }).error,
        undefined
    );
    assert.ok(
        reviewSchema.validate({
            review: { rating: 0, comment: "Great stay" }
        }).error
    );
});

test("listing review form requires a one-to-five-star rating without a zero-star option", () => {
    const showTemplate = fs.readFileSync(
        path.join(__dirname, "..", "views", "listings", "show.ejs"),
        "utf8"
    );

    assert.match(showTemplate, /name="review\[rating\]"/);
    assert.match(showTemplate, /rating === 5 \? "required" : ""/);
    assert.match(showTemplate, /for \(let rating = 5; rating >= 1; rating--\)/);
    assert.doesNotMatch(showTemplate, /name="review\[rating\]"[^>]*value="0"/);
});

test("login and signup provide accessible password visibility toggles", () => {
    for (const page of ["login", "signup"]) {
        const template = fs.readFileSync(
            path.join(__dirname, "..", "views", "users", `${page}.ejs`),
            "utf8"
        );
        assert.match(template, /class="password-toggle"/);
        assert.match(template, /aria-label="Show password"/);
        assert.match(template, /aria-controls="password"/);
    }
});

test("models provide consistent defaults and required associations", () => {
    const listing = new Listing({
        title: "Stay",
        price: 100,
        location: "Pune",
        country: "India"
    });
    assert.equal(listing.maxGuests, 2);

    const user = new User({
        username: "guest",
        email: "guest@example.com",
        password: "hash"
    });
    assert.equal(user.role, "guest");

    const review = new Review({
        rating: 5,
        comment: "Great",
        author: user._id
    });
    assert.ok(review.validateSync().errors.listing);
});

test("username authentication supports current bcrypt and existing Passport passwords", async () => {
    const bcryptUser = new User({
        username: "bcrypt-user",
        email: "bcrypt@example.com",
        password: await bcrypt.hash("correct-password", 4)
    });
    assert.equal(await verifyUserPassword(bcryptUser, "correct-password"), true);
    assert.equal(await verifyUserPassword(bcryptUser, "wrong-password"), false);

    const legacyUser = new User({
        username: "legacy-user",
        email: "legacy@example.com"
    });
    await legacyUser.setPassword("legacy-password");
    assert.equal(await verifyUserPassword(legacyUser, "legacy-password"), true);
    assert.equal(await verifyUserPassword(legacyUser, "wrong-password"), false);
});

test("new passwords use bcrypt hashes with independent salts", async () => {
    const password = "correct-horse-battery-staple";
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    assert.notEqual(firstHash, secondHash);
    assert.equal(await bcrypt.compare(password, firstHash), true);
    assert.equal(await bcrypt.compare(password, secondHash), true);
});

test("signup session is established after safe session regeneration", async () => {
    const calls = [];
    const req = {
        session: {
            regenerate(callback) {
                calls.push("regenerate");
                callback(null);
            },
            save(callback) {
                calls.push("save");
                callback(null);
            }
        }
    };

    await startUserSession(req, "user-id");
    assert.deepEqual(calls, ["regenerate", "save"]);
    assert.equal(req.session.userId, "user-id");
});

test("toast partial renders invalid booking feedback as a dismissible toast", async () => {
    const flashTemplate = path.join(__dirname, "..", "views", "includes", "flash.ejs");
    const html = await ejs.renderFile(flashTemplate, {
        success: undefined,
        error: "Check-out must be after check-in."
    });

    assert.match(html, /app-toast-error/);
    assert.match(html, /Check-out must be after check-in\./);
    assert.match(html, /data-bs-dismiss="toast"/);
});

test("invalid booking submissions return to the listing with an error toast", () => {
    const req = { session: {} };
    let redirectPath;
    const res = {
        redirect(pathname) {
            redirectPath = pathname;
        }
    };

    bookingController.redirectWithBookingError(
        req,
        res,
        "507f1f77bcf86cd799439011",
        "Check-out must be after check-in."
    );

    assert.equal(redirectPath, "/listings/507f1f77bcf86cd799439011");
    assert.equal(req.session.error, "Check-out must be after check-in.");
});

test("ExpressError uses HTTP status code as its first argument", () => {
    const error = new ExpressError(404, "Not Found");
    assert.equal(error.statusCode, 404);
    assert.equal(error.message, "Not Found");
});

test("booking dates accept only real calendar dates in date-input format", () => {
    assert.equal(parseDateOnly("2026-10-21").toISOString(), "2026-10-21T00:00:00.000Z");
    assert.equal(parseDateOnly("2026-02-30"), null);
    assert.equal(parseDateOnly("10/21/2026"), null);
});

test("all EJS templates compile", () => {
    const viewsDirectory = path.join(__dirname, "..", "views");
    const templates = [];
    const collectTemplates = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                collectTemplates(entryPath);
            } else if (entry.name.endsWith(".ejs")) {
                templates.push(entryPath);
            }
        }
    };

    collectTemplates(viewsDirectory);
    assert.ok(templates.length > 0);
    for (const template of templates) {
        assert.doesNotThrow(() => ejs.compile(fs.readFileSync(template, "utf8")), template);
    }
});
