
const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home");

router.get("/", homeController.home);

router.use("/", require("./user"));
router.use("/", require("./listing"));
router.use("/", require("./booking"));
router.use("/", require("./review"));
router.use("/", require("./admin"));

module.exports = router;
