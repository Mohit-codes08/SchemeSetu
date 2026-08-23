const express = require("express");
const router = express.Router();
const { matchSchemes } = require("../controllers/schemeController");

router.post("/match", matchSchemes);

module.exports = router;