const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const assetController = require("../controller/asset_controller");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("index", {
    user: req.user, 
  });
});

router.get("/portfolios", ensureAuthenticated, assetController.portfolio);
router.get("/new-portfolio", ensureAuthenticated, controller.newPortfolio);
router.post(
  "/new-portfolio",
  ensureAuthenticated,
  controller.createNewPortfolio
);
router.get(
  "/portfolios/:id",
  ensureAuthenticated,
  assetController.viewPortfolio
);

router.get(
  "/asset-current-price",
  ensureAuthenticated,
  assetController.assetCurrentPrice
);
router.get(
  "/portfolios/:id/buy-asset",
  ensureAuthenticated,
  assetController.renderBuyAsset
);
router.post(
  "/portfolios/:id/buy-asset",
  ensureAuthenticated,
  assetController.buyAsset
);
router.get(
  "/portfolios/:id/sell-asset",
  ensureAuthenticated,
  assetController.renderSellAsset
);
router.post(
  "/portfolios/:id/sell-asset",
  ensureAuthenticated,
  assetController.sellAsset
);
router.get(
  "/portfolios/:id/sync",
  ensureAuthenticated,
  assetController.syncAssets
);
router.get(
  "/portfolios/:id/delete",
  ensureAuthenticated,
  assetController.deletePortfolio
);

// restful API routes
// router.get("/users/:email", controller.getUserByEmail);
router.get('/portfolio/user/:userId', ensureAuthenticated, controller.getPortfoliosByUserId);
router.get("/assets/portfolio/:portfolioId", controller.getAssetsByPortfolioId);
router.get("/assets/category/:category", controller.getAssetsByCategory);
router.get("/assets/ticker/:ticker", controller.getAssetsByTicker);
router.get("/assets/type/:type", controller.getAssetsByType);
// router.post("/users", controller.createUser);
router.put("/assets/:ticker/type", controller.changeAssetType);
router.delete("/assets/:ticker", controller.deleteAssetIfSold);
router.delete("/portfolio/:id", controller.deletePortfolioIfEmpty);

module.exports = router;
