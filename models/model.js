const express = require("express");
const app = express();
const { Sequelize, DataTypes } = require("sequelize");
const md5 = require("js-md5");
require("dotenv").config();

const seq = new Sequelize(
  "portfolio_manager",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

const User = seq.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    hashed_pass: {
      type: DataTypes.CHAR(32),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

const Portfolio = seq.define(
  "Portfolio",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: seq.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "portfolio",
    timestamps: false,
  }
);

const Asset = seq.define(
  "Asset",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    portfolio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticker: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    buy_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    current_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    purchased_at: {
      type: DataTypes.DATE,
      defaultValue: seq.literal("CURRENT_TIMESTAMP"),
    },
    type: {
      type: DataTypes.ENUM("buy", "sell", "keep"),
      allowNull: false,
    },
  },
  {
    tableName: "assets",
    timestamps: false,
  }
);



// get all portfolios a user has
async function getPortfoliosByUserId(userId) {
  return await Portfolio.findAll({
    where: { user_id: userId },
  });
}

// get all assets in a portfolio
async function getAssetsByPortfolioId(portfolioId) {
  return await Asset.findAll({
    where: { portfolio_id: portfolioId },
  });
}

// get assets by category in a portfolio
async function getAssetsByCategory(portfolioId, category) {
  return await Asset.findAll({
    where: { portfolio_id: portfolioId, category: category },
  });
}

// get assets by ticker in a portfolio
async function getAssetsByTicker(portfolioId, ticker) {
  return await Asset.findAll({
    where: { portfolio_id: portfolioId, ticker: ticker },
  });
}
// get assets by type in a portfolio
async function getAssetsByType(portfolioId, type) {
  return await Asset.findAll({
    where: { portfolio_id: portfolioId, type: type },
  });
}

// Create user
async function createUser(email, hashed_pass) {
  return await User.create({
    email: email,
    hashed_pass: hashed_pass,
  });
  return await User.create({
    email: email,
    hashed_pass: hashed_pass,
  });
}

// get user by email
async function getUserByEmail(email) {
  return await User.findOne({
    where: {
      email: email,
    },
  });

}

// change asset type
async function changeAssetType(assetId, newType) {
  return await Asset.update(
    { type: newType },
    { where: { id: assetId } }
  );
}

// delete asset in a portfolio if sold
async function deleteAssetIfSold(assetId) {
  const asset = await Asset.findOne({ where: { id: assetId } });
  if (asset && asset.type === 'sell') {
    return await Asset.destroy({ where: { id: assetId } });
  }
  return 0; 
}

// delete portfolio if empty
async function deletePortfolioIfEmpty(portfolioId) {
  const assets = await getAssetsByPortfolioId(portfolioId);
  if (!assets || assets.length === 0) {
    return await Portfolio.destroy({ where: { id: portfolioId } });
  }
  return 0;
}

module.exports = {
  seq,
  User,
  Portfolio,
  Asset,
  getPortfoliosByUserId,
  getAssetsByPortfolioId,
  getAssetsByCategory,
  getAssetsByTicker,
  getAssetsByType,
  createUser,
  getUserByEmail,
  changeAssetType,
  deleteAssetIfSold,
  deletePortfolioIfEmpty
};