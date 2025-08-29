const { getAssetsByUserId, Asset } = require("../models/model");
const axios = require("axios");

const portfolio = async (req, res) => {
  const portfolioItems = await getAssetsByUserId(req.user.id);
  res.render("my_portfolio", { portfolioItems });
};

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

const assetCurrentPrice = async (req, res) => {
  const { symbol } = req.query;
  try {
    const currentPrice = await getCurrentAssetPrice(symbol);
    res.json({ price: currentPrice });
  } catch (error) {
    console.error("Error fetching asset current price:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const renderBuyAsset = (req, res) => {
  res.render("buy_asset");
};

const buyAsset = async (req, res) => {
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
};

const renderSellAsset = async (req, res) => {
  const assets = await Asset.findAll({ where: { user_id: req.user.id } });
  res.render("sell_asset", { assets });
};

const sellAsset = async (req, res) => {
  const { asset_id, quantity, price } = req.body;

  try {
    const asset = await Asset.findOne({
      where: { id: asset_id, user_id: req.user.id },
    });

    if (!asset) {
      req.flash("error", "Asset not found.");
      return res.redirect("/my-portfolio");
    }

    // Check if the user is trying to sell more than they own
    if (quantity > asset.quantity) {
      req.flash("error", "Insufficient asset quantity.");
      return res.redirect("/sell-asset");
    }

    await Asset.update(
      { quantity: asset.quantity - quantity, type: "sell" },
      { where: { id: asset_id } }
    );

    req.flash("notice", "Asset sold successfully!");
    res.redirect("/my-portfolio");
  } catch (error) {
    console.error("Error selling asset:", error);
    req.flash("error", "Error selling asset. Please try again.");
    res.redirect("/sell-asset");
  }
};

module.exports = {
  renderBuyAsset,
  buyAsset,
  renderSellAsset,
  sellAsset,
  assetCurrentPrice,
  portfolio,
};
