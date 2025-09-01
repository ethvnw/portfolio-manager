const {
  getAssetsByPortfolioId,
  getAssetsByCategory,
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

const deletePortfolio = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findOne({
    where: { id, user_id: req.user.id },
  });
  if (!portfolio) {
    req.flash("error", "Portfolio not found.");
    return res.redirect("/portfolios");
  }
  const assets = await getAssetsByPortfolioId(id);
  if (assets.length > 0) {
    req.flash("error", "Portfolio is not empty.");
    return res.redirect("/portfolios");
  }
  await portfolio.destroy();
  req.flash("notice", "Portfolio deleted successfully.");
  res.redirect("/portfolios");
};

const getAssetPrice = async (symbol, date = null) => {
  if (!date) {
    try {
      const result = await yahooFinance.quote(symbol);
      return result.regularMarketPrice;
    } catch (error) {
      console.error("Error fetching asset current price:", error);
      throw error;
    }
  } else {
    try {
      date = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const result = await yahooFinance.chart(symbol, {
        period1: date,
        period2: nextDay,
      });
      return parseFloat(result.quotes[0].close.toFixed(2));
    } catch (error) {
      console.error("Error fetching asset historical price:", error);
      throw error;
    }
  }
};

const assetCurrentPrice = async (req, res) => {
  const { symbol, date } = req.query;
  try {
    const currentPrice = await getAssetPrice(symbol, date);
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

  const { assetName, assetTicker, assetType, quantity, buyDate } = req.body;
  const buyPrice = await getAssetPrice(assetTicker, buyDate);
  try {
    const newAsset = await Asset.create({
      user_id: req.user.id,
      name: assetName,
      ticker: assetTicker ? assetTicker : "N/A",
      category: assetType,
      quantity: parseFloat(quantity),
      buy_price: buyPrice,
      current_price: assetTicker ? await getAssetPrice(assetTicker) : 0,
      currency: "USD",
      type: "buy",
      portfolio_id: portfolio.id,
      purchased_at: buyDate,
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

    // Check if the user is trying to sell more than they own
    if (parseFloat(quantity) > asset.quantity) {
      req.flash("error", "Insufficient asset quantity.");
      return res.redirect(`/portfolios/${portfolio.id}/sell-asset`);
    }

    if (parseFloat(quantity) === parseFloat(asset.quantity)) {
      await Asset.destroy({ where: { id: asset_id } });
      req.flash("notice", "Asset removed successfully");
      return res.redirect(`/portfolios/${portfolio.id}`);
    } else {
      await Asset.update(
        { quantity: asset.quantity - quantity, type: "sell" },
        { where: { id: asset_id } }
      );
      req.flash("notice", `${parseFloat(quantity)} units removed successfully`);
      res.redirect(`/portfolios/${portfolio.id}`);
    }
  } catch (error) {
    console.error("Error selling asset:", error);
    req.flash("error", "Error selling asset. Please try again.");
    res.redirect(`/portfolios/${portfolio.id}/sell-asset`);
  }
};

const syncAssets = async (req, res) => {
  const stocks = await getAssetsByCategory("stocks", req.params.id);

  try {
    for (const stock of stocks) {
      const currentPrice = await getAssetPrice(stock.ticker);
      await Asset.update(
        { current_price: currentPrice },
        { where: { id: stock.id } }
      );
    }
    req.flash("notice", "Assets synchronised successfully");
    res.redirect(`/portfolios/${req.params.id}`);
  } catch (error) {
    console.error("Error synchronising assets:", error);
    req.flash("error", "Error synchronising assets. Please try again.");
    res.redirect(`/portfolios/${req.params.id}`);
  }
};

module.exports = {
  renderBuyAsset,
  buyAsset,
  renderSellAsset,
  sellAsset,
  assetCurrentPrice,
  portfolio,
  viewPortfolio,
  syncAssets,
  deletePortfolio,
};
