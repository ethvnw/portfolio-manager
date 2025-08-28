const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const { ensureAuthenticated } = require("../middleware/auth");

/* GET home page. */
router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("index");
});

router.get("/buyassets", function (req, res, next) {
  res.render("buyassets.pug", { const1: "value" });
});

router.get("/sellassets", function (req, res, next) {
  res.render("sellassets.pug", { const1: "value" });
});


module.exports = router;
