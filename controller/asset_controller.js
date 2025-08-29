const {
  getAssetsByPortfolioId,
  getPortfoliosByUserId,
  Asset,
  Portfolio,
} = require("../models/model");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

const portfolio = async (req, res) => {
  const portfolios = await getPortfoliosByUserId(req.user.id);
  res.render("portfolios", { portfolios });
};

const viewPortfolio = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({
    where: { id, user_id: req.user.id },
  });
  if (!portfolio) {
    req.flash("error", "Portfolio not found.");
    return res.redirect("/portfolios");
  }
  const portfolioItems = await getAssetsByPortfolioId(id);
  res.render("view_portfolio", { portfolio, portfolioItems });
};

const newPortfolio = (req, res) => {
  res.render("new_portfolio");
};

const createNewPortfolio = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newPortfolio = await Portfolio.create({
      user_id: req.user.id,
      name,
      description,
    });
    req.flash("notice", "Portfolio created successfully!");
    res.redirect("/portfolios");
  } catch (error) {
    console.error("Error creating portfolio:", error);
    req.flash("error", "Error creating portfolio. Please try again.");
    res.redirect("/new-portfolio");
  }
};

const getCurrentAssetPrice = async (symbol) => {
  try {
    const result = await yahooFinance.quote(symbol);
    return result.regularMarketPrice;
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

const renderBuyAsset = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({
    where: { id, user_id: req.user.id },
  });
  res.render("buy_asset", { portfolio });
};

const buyAsset = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({
    where: { id, user_id: req.user.id },
  });
  if (!portfolio) {
    req.flash("error", "Portfolio not found.");
    return res.redirect("/portfolios");
  }

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
      portfolio_id: portfolio.id,
    });
    req.flash("notice", "Asset purchased successfully!");
    res.redirect(`/portfolios/${portfolio.id}`);
  } catch (error) {
    console.error("Error purchasing asset:", error);
    req.flash("error", "Error purchasing asset. Please try again.");
    res.redirect(`/portfolio/${portfolio.id}/buy-asset`);
  }
};

const renderSellAsset = async (req, res) => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, user_id: req.user.id },
  });
  const assets = await getAssetsByPortfolioId(portfolio.id);
  res.render("sell_asset", { portfolio, assets });
};

const sellAsset = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({
    where: { id, user_id: req.user.id },
  });
  if (!portfolio) {
    req.flash("error", "Portfolio not found.");
    return res.redirect("/portfolios");
  }

  const { asset_id, quantity, price } = req.body;

  try {
    const asset = await Asset.findOne({
      where: { id: asset_id },
    });

    if (!asset) {
      req.flash("error", "Asset not found.");
      return res.redirect(`/portfolios/${portfolio.id}/sell-asset`);
    }

    console.log("asset quantity:", asset.quantity);
    console.log("quantity", quantity);
    // Check if the user is trying to sell more than they own
    if (parseFloat(quantity) > asset.quantity) {
      req.flash("error", "Insufficient asset quantity.");
      return res.redirect(`/portfolios/${portfolio.id}/sell-asset`);
    }

    await Asset.update(
      { quantity: asset.quantity - quantity, type: "sell" },
      { where: { id: asset_id } }
    );

    req.flash("notice", "Asset sold successfully!");
    res.redirect(`/portfolios/${portfolio.id}`);
  } catch (error) {
    console.error("Error selling asset:", error);
    req.flash("error", "Error selling asset. Please try again.");
    res.redirect(`/portfolios/${portfolio.id}/sell-asset`);
  }
};

module.exports = {
  renderBuyAsset,
  buyAsset,
  renderSellAsset,
  sellAsset,
  assetCurrentPrice,
  portfolio,
  newPortfolio,
  createNewPortfolio,
  viewPortfolio,
};
