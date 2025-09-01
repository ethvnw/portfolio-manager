const express = require("express");
const controller = require("../controller/controller.js");
const model = require("../models/model.js");

// Mock the model
jest.mock("../models/model.js");

describe("Controller Tests", () => {
  let app;
  let req, res;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    req = {
      user: { id: 1 },
      params: {},
      body: {},
      flash: jest.fn(),
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getPortfoliosByUserId", () => {
    it("should return portfolios for authenticated user", async () => {
      const mockPortfolios = [{ id: 1, name: "Test Portfolio" }];
      model.getPortfoliosByUserId.mockResolvedValue(mockPortfolios);

      await controller.getPortfoliosByUserId(req, res);

      expect(model.getPortfoliosByUserId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ portfolios: mockPortfolios });
    });

    it("should return 401 for unauthenticated user", async () => {
      req.user = null;

      await controller.getPortfoliosByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should handle server errors", async () => {
      model.getPortfoliosByUserId.mockRejectedValue(new Error("DB Error"));

      await controller.getPortfoliosByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });

  describe("getAssetsByPortfolioId", () => {
    it("should return assets when found", async () => {
      req.params.portfolioId = "1";
      const mockAssets = [{ id: 1, ticker: "AAPL" }];
      model.getAssetsByPortfolioId.mockResolvedValue(mockAssets);

      await controller.getAssetsByPortfolioId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ assets: mockAssets });
    });

    it("should return 404 when no assets found", async () => {
      req.params.portfolioId = "1";
      model.getAssetsByPortfolioId.mockResolvedValue([]);

      await controller.getAssetsByPortfolioId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No assets found for portfolio 1",
      });
    });

    it("should handle errors", async () => {
      req.params.portfolioId = "1";
      model.getAssetsByPortfolioId.mockRejectedValue(new Error("DB Error"));

      await controller.getAssetsByPortfolioId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
    });
  });

  describe("getAssetsByCategory", () => {
    it("should return assets by category", async () => {
      req.params = { portfolioId: "1", category: "stocks" };
      const mockAssets = [{ id: 1, category: "stocks" }];
      model.getAssetsByCategory.mockResolvedValue(mockAssets);

      await controller.getAssetsByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ assets: mockAssets });
    });

    it("should return 404 when no assets found in category", async () => {
      req.params = { portfolioId: "1", category: "bonds" };
      model.getAssetsByCategory.mockResolvedValue([]);

      await controller.getAssetsByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No assets found in category bonds for portfolio 1",
      });
    });
  });

  describe("changeAssetType", () => {
    it("should change asset type successfully", async () => {
      req.params.id = "1";
      req.body.type = "bond";
      model.changeAssetType.mockResolvedValue();

      await controller.changeAssetType(req, res);

      expect(model.changeAssetType).toHaveBeenCalledWith("1", "bond");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asset type changed to bond",
      });
    });

    it("should handle errors when changing asset type", async () => {
      req.params.id = "1";
      req.body.type = "bond";
      model.changeAssetType.mockRejectedValue(new Error("Update failed"));

      await controller.changeAssetType(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Update failed" });
    });
  });

  describe("deleteAssetIfSold", () => {
    it("should delete sold asset successfully", async () => {
      req.params.id = "1";
      model.deleteAssetIfSold.mockResolvedValue(true);

      await controller.deleteAssetIfSold(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asset with ID 1 deleted",
      });
    });

    it("should return 404 when asset not found or not sold", async () => {
      req.params.id = "1";
      model.deleteAssetIfSold.mockResolvedValue(false);

      await controller.deleteAssetIfSold(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Asset with ID 1 not found or not marked as sold",
      });
    });
  });

  describe("createNewPortfolio", () => {
    it("should create portfolio successfully", async () => {
      req.body = { name: "Test Portfolio", description: "Test Description" };
      model.Portfolio = { create: jest.fn().mockResolvedValue({ id: 1 }) };

      await controller.createNewPortfolio(req, res);

      expect(model.Portfolio.create).toHaveBeenCalledWith({
        user_id: 1,
        name: "Test Portfolio",
        description: "Test Description",
      });
      expect(req.flash).toHaveBeenCalledWith(
        "notice",
        "Portfolio created successfully!"
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolios");
    });

    it("should handle portfolio creation errors", async () => {
      req.body = { name: "Test Portfolio", description: "Test Description" };
      model.Portfolio = {
        create: jest.fn().mockRejectedValue(new Error("Creation failed")),
      };

      await controller.createNewPortfolio(req, res);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Error creating portfolio. Please try again."
      );
      expect(res.redirect).toHaveBeenCalledWith("/new-portfolio");
    });
  });

  describe("newPortfolio", () => {
    it("should render new portfolio page", () => {
      controller.newPortfolio(req, res);
      expect(res.render).toHaveBeenCalledWith("new_portfolio");
    });
  });

  describe("deletePortfolioIfEmpty", () => {
    it("should delete empty portfolio", async () => {
      req.params.id = "1";
      model.deletePortfolioIfEmpty.mockResolvedValue(true);

      await controller.deletePortfolioIfEmpty(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Portfolio 1 deleted" });
    });

    it("should return 404 when portfolio not empty or not found", async () => {
      req.params.id = "1";
      model.deletePortfolioIfEmpty.mockResolvedValue(false);

      await controller.deletePortfolioIfEmpty(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Portfolio 1 not found or not empty",
      });
    });
  });
});
