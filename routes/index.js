const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const { ensureAuthenticated } = require("../middleware/auth");
const { getAssetsByUserId, Asset } = require("../models/model");
const axios = require("axios");
require("dotenv").config();

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("index");
});

router.get("/my-portfolio", ensureAuthenticated, async (req, res, next) => {
  const portfolioItems = await getAssetsByUserId(req.user.id);
  res.render("my_portfolio", { portfolioItems });
});

const getCurrentAssetPrice = async (symbol) => {
  const apiUrl = `${process.env.API_URL}${symbol}`;
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    return data["Time Series (Daily)"][
      Object.keys(data["Time Series (Daily)"])[0]
    ]["4. close"];
  } catch (error) {
    console.error("Error fetching asset current price:", error);
    throw error;
  }
};

router.get(
  "/asset-current-price",
  ensureAuthenticated,
  async (req, res, next) => {
    const { symbol } = req.query;
    try {
      const currentPrice = await getCurrentAssetPrice(symbol);
      res.json({ price: currentPrice });
    } catch (error) {
      console.error("Error fetching asset current price:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/buy-asset", ensureAuthenticated, function (req, res, next) {
  res.render("buy_asset", { const1: "value" });
});

router.post("/buy-asset", ensureAuthenticated, async (req, res, next) => {
  const { assetName, assetTicker, assetType, quantity, buyPrice } = req.body;
  try {
    const newAsset = await Asset.create({
      user_id: req.user.id,
      name: assetName,
      ticker: assetTicker ? assetTicker : "N/A",
      category: assetType,
      quantity: parseFloat(quantity),
      buy_price: parseFloat(buyPrice),
      current_price: assetTicker ? await getCurrentAssetPrice(assetTicker) : 0,
      currency: "USD",
      type: "buy",
    });
    req.flash("notice", "Asset purchased successfully!");
    res.redirect("/my-portfolio");
  } catch (error) {
    console.error("Error purchasing asset:", error);
    req.flash("error", "Error purchasing asset. Please try again.");
    res.redirect("/buy-asset");
  }
});

router.get("/sell-asset", ensureAuthenticated, function (req, res, next) {
  res.render("sell_asset", { const1: "value" });
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
