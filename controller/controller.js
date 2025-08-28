const express = require('express');
const axios = require('axios');
const app = express();
const model = require('../models/model.js');
const port = 3000;
const md5 = require('js-md5');
require("dotenv").config();


// register a new user

// login in user

// get all user's assets
async function getAssetsByUserId(userId) {
    try{
        await model.getUserById(userId);
        const user = req.params;
        const assets = await model.getAssetsByUserId(userId);
        if (assets.length > 0) {
            res.status(200).json({ message: `${user.email}'s assets found` });
        } else {
            res.status(404).json({ message: `${user.email} has no assets` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message } );
        console.error("error fetching assets:", error);
    }
}

// get user's assets by category
async function getAssetsByCategory(req, res) {
    try{

        const category = req.params.category;
        await model.getAssetsByCategory(category);
        const assets = await model.getAssetsByCategory(category);
        if (assets.length > 0) {
            res.status(200).json({ message: `assets in category ${category} found` });
        } else {
            res.status(404).json({ message: `no assets found in category ${category}` });
        }
    }catch(error){  
        res.status(500).json({ error: error.message } );
        console.error("error fetching assets:", error);
    }
}


// get user's assets by ticker
async function getAssetsByTicker(req, res) {
    try {
        const ticker = req.params.ticker;
        await model.getAssetsByTicker(ticker);
        const assets = await model.getAssetsByTicker(ticker);
        if (assets.length > 0) {
            res.status(200).json({ message: `assets with ticker ${ticker} found` });
        } else {
            res.status(404).json({ message: `no assets found with ticker ${ticker}` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error fetching assets:", error);
    }
}
// get user's assets by type
async function getAssetsByType(req, res) {
    try {
        const type = req.params.type;
        await model.getAssetsByType(type);
        const assets = await model.getAssetsByType(type);
        if (assets.length > 0) {
            res.status(200).json({ message: `assets of type ${type} found` });
        } else {
            res.status(404).json({ message: `no assets found of type ${type}` });
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

// delete asset if sold
async function deleteAssetIfSold(req, res) {
    try {
        const assetId = req.params.id;
        const asset = await model.getAssetById(assetId);
        if (asset && asset.status === 'sold') {
            await model.deleteAsset(assetId);
            res.status(200).json({ message: `Asset with ID ${assetId} deleted` });
        } else {
            res.status(404).json({ message: `Asset with ID ${assetId} not found or not sold` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error("error deleting asset:", error);
    }
}

module.exports = {
    getAssetsByUserId,
    getAssetsByCategory,
    getAssetsByTicker,
    getAssetsByType,
    createUser,
    getUserByEmail,
    changeAssetType,
    deleteAssetIfSold
};



