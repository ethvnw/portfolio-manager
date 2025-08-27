const express = require('express');
const app = express();
const { sequelize, DataTypes } = require('sequelize');
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

const Portfolio = seq.define('Portfolio', {
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: seq.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'portfolio',
    schema: 'portfolio_manager',
    timestamps: false,
});

const Asset = seq.define('Asset', {
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
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
    },
    purchased_at: {
        type: DataTypes.DATE,
        defaultValue: seq.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'assets',
    schema: 'portfolio_manager',
    timestamps: false,
});

const Transaction = seq.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    portfolio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    ticker: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: seq.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'transactions',
    schema: 'portfolio_manager',
    timestamps: false,
});


//current iteration, functionality to be changed
async function getPortfolioByUserId(userId) {
    return await Portfolio.findAll({
        where: {
            user_id: userId
        }
    });
}

async function getAssetsByPortfolioId(portfolioId) {
    return await Asset.findAll({
        where: {
            portfolio_id: portfolioId
        }
    });
}

async function getTransactionsByPortfolioId(portfolioId) {
    return await Transaction.findAll({
        where: {
            portfolio_id: portfolioId
        }
    });
}



module.exports = {
    seq,
    User,
    Portfolio,
    Asset,
    Transaction,
    getPortfolioByUserId,
    getAssetsByPortfolioId,
    getTransactionsByPortfolioId
};