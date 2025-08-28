const express = require('express');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
require("dotenv").config();

const seq = new Sequelize('portfolio_manager', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql"
});

const User = seq.define('User', {
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
}, {
    tableName: 'users',
    schema: 'portfolio_manager',
    timestamps: false,
});


const Asset = seq.define('Asset', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
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
        defaultValue: seq.literal('CURRENT_TIMESTAMP'),

    },
    type: {
        type: DataTypes.ENUM('buy', 'sell', 'keep'),
        allowNull: false,
    },
}, {
    tableName: 'assets',
    schema: 'portfolio_manager',
    timestamps: false,
});





//current iteration, functionality to be changed


//user can get all assets in their portfolio
async function getAssetsByUserId(userId) {
    return await Asset.findAll({
        where: {
            user_id: userId
        }
    });
}

//user can search by category
async function getAssetsByCategory(category) {
    return await Asset.findAll({
        where: {
            category: category
        }
    });
}
//user can get assets by ticker, to get a specific asset
async function getAssetsByTicker(ticker) {
    return await Asset.findAll({
        where: {
            ticker: ticker
        }
    });
}
//user can see if assets are ones bought, sold or kept
async function getAssetsByType(type) {
    return await Asset.findAll({
        where: {
            type: type
        }
    });
}

module.exports = {
    seq,
    User,
    Asset,
    getAssetsByUserId,
    getAssetsByCategory,
    getAssetsByTicker,
    getAssetsByType
};