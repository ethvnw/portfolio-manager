const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const assetController = require("../controller/asset_controller");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("index");
});

router.get("/my-portfolio", ensureAuthenticated, assetController.portfolio);
router.get(
  "/asset-allocation",
  ensureAuthenticated,
  assetController.assetAllocation
);
router.get(
  "/portfolio-value-over-time",
  ensureAuthenticated,
  assetController.portfolioValOverTime
);

router.get(
  "/asset-current-price",
  ensureAuthenticated,
  assetController.assetCurrentPrice
);
router.get("/buy-asset", ensureAuthenticated, assetController.renderBuyAsset);
router.post("/buy-asset", ensureAuthenticated, assetController.buyAsset);
router.get("/sell-asset", ensureAuthenticated, assetController.renderSellAsset);
router.post("/sell-asset", ensureAuthenticated, assetController.sellAsset);

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
