const express = require('express');
const axios = require('axios');
const app = express();
const model = require('../models/model.js');

const port = 3000;
const md5 = require('js-md5');
require("dotenv").config();


// register a new user

// login in user


//create new portfolio
const newPortfolio = (req, res) => {
  res.render("new_portfolio");
};
const createNewPortfolio = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newPortfolio = await model.Portfolio.create({
      user_id: req.user.id,
      name,
      description,
    });

    if (req.accepts && req.accepts('json') && !req.accepts('html')) {
      return res.status(201).json(newPortfolio);
    }

    req.flash("notice", "Portfolio created successfully!");
    res.redirect("/portfolios");
  } catch (error) {
    console.error("Error creating portfolio:", error);

    if (req.accepts && req.accepts('json')) {
      return res.status(400).json({ error: error.message });
    }

    req.flash("error", "Error creating portfolio. Please try again.");
    res.redirect("/new-portfolio");
  }
};

//get all user's portfolio
async function getPortfoliosByUserId(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const portfolios = await model.getPortfoliosByUserId(userId);
    res.json({ portfolios });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// get all assets in a portfolio
async function getAssetsByPortfolioId(req, res) {
    try {
        const portfolioId = req.params.portfolioId;
        const assets = await model.getAssetsByPortfolioId(portfolioId);
        if (assets.length > 0) {
            res.status(200).json({ assets });
        } else {
            res.status(404).json({ message: `No assets found for portfolio ${portfolioId}` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error fetching assets:", error);
    }
}

//get assets by category in a portfolio
async function getAssetsByCategory(req, res) {
    try {
        const portfolioId = req.params.portfolioId;
        const category = req.params.category;
        const assets = await model.getAssetsByCategory(portfolioId, category);
        if (assets.length > 0) {
            res.status(200).json({ assets });
        } else {
            res.status(404).json({ message: `No assets found in category ${category} for portfolio ${portfolioId}` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error fetching assets:", error);
    }
}

// get assets by ticker in a portfolio
async function getAssetsByTicker(req, res) {
    try {
        const portfolioId = req.params.portfolioId;
        const ticker = req.params.ticker;
        const assets = await model.getAssetsByTicker(portfolioId, ticker);
        if (assets.length > 0) {
            res.status(200).json({ assets });
        } else {
            res.status(404).json({ message: `No assets found with ticker ${ticker} for portfolio ${portfolioId}` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error fetching assets:", error);
    }
}

// get assets by type in a portfolio
async function getAssetsByType(req, res) {
    try {
        const portfolioId = req.params.portfolioId;
        const type = req.params.type;
        const assets = await model.getAssetsByType(portfolioId, type);
        if (assets.length > 0) {
            res.status(200).json({ assets });
        } else {
            res.status(404).json({ message: `No assets found of type ${type} for portfolio ${portfolioId}` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error fetching assets:", error);
    }
}

// change asset type
async function changeAssetType(req, res) {
    try {
        const assetId = req.params.id;
        const newType = req.body.type;
        await model.changeAssetType(assetId, newType);
        res.status(200).json({ message: `Asset type changed to ${newType}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error changing asset type:", error);
    }
}

// delete asset in a portfolio if sold
async function deleteAssetIfSold(req, res) {
    try {
        const assetId = req.params.id;
        const result = await model.deleteAssetIfSold(assetId);
        if (result) {
            res.status(200).json({ message: `Asset with ID ${assetId} deleted` });
        } else {
            res.status(404).json({ message: `Asset with ID ${assetId} not found or not marked as sold` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error deleting asset:", error);
    }
}
//delete portfolio if empty
async function deletePortfolioIfEmpty(req, res) {
    try {
        const portfolioId = req.params.id;
        const result = await model.deletePortfolioIfEmpty(portfolioId);
        if (result) {
            res.status(200).json({ message: `Portfolio ${portfolioId} deleted` });
        } else {
            res.status(404).json({ message: `Portfolio ${portfolioId} not found or not empty` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error deleting portfolio:", error);
    }
}

module.exports = {
    getPortfoliosByUserId,
    getAssetsByPortfolioId,
    getAssetsByCategory,
    getAssetsByTicker,
    getAssetsByType,
    changeAssetType,
    deleteAssetIfSold,
    createNewPortfolio,
    newPortfolio,
    deletePortfolioIfEmpty
};



