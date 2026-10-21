
const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const { isLoggedIn } = require("../middleware/auth");

router.get("/signup", userController.renderSignup);
router.post("/signup", userController.signup);

router.get("/login", userController.renderLogin);
router.post("/login", userController.login);

router.get("/logout", userController.logout);

router.post(
    "/become-host",
    isLoggedIn,
    userController.becomeHost
);

module.exports = router;
