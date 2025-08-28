const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const { ensureAuthenticated } = require("../middleware/auth");


router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("index");
});

router.get("/buyassets", function (req, res, next) {
  res.render("buyassets.pug", { const1: "value" });
});

router.get("/sellassets", function (req, res, next) {
  res.render("sellassets.pug", { const1: "value" });
});


// restful API routes
// router.get("/users/:email", controller.getUserByEmail);
router.get("/assets/user/:userId", controller.getAssetsByUserId);
router.get("/assets/category/:category", controller.getAssetsByCategory);
router.get("/assets/ticker/:ticker", controller.getAssetsByTicker);
router.get("/assets/type/:type", controller.getAssetsByType);
// router.post("/users", controller.createUser);
router.put("/assets/:ticker/type", controller.changeAssetType);
router.delete("/assets/:ticker", controller.deleteAssetIfSold);

module.exports = router;
