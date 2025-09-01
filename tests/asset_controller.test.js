const yahooFinance = require("yahoo-finance2").default;

const {
  renderBuyAsset,
  buyAsset,
  renderSellAsset,
  sellAsset,
  assetCurrentPrice,
  portfolio,
  viewPortfolio,
} = require("../controller/asset_controller");
const {
  getAssetsByPortfolioId,
  getPortfoliosByUserId,
  Asset,
  Portfolio,
} = require("../models/model");

jest.mock("../models/model");
jest.mock("yahoo-finance2", () => ({
  default: {
    quote: jest.fn(),
  },
}));

describe("Asset Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      query: {},
      body: {},
      user: { id: 1 },
      flash: jest.fn(),
    };
    res = {
      render: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("portfolio", () => {
    it("should render portfolios page with user portfolios", async () => {
      const mockPortfolios = [{ id: 1, name: "Test Portfolio" }];
      getPortfoliosByUserId.mockResolvedValue(mockPortfolios);

      await portfolio(req, res);

      expect(getPortfoliosByUserId).toHaveBeenCalledWith(1);
      expect(res.render).toHaveBeenCalledWith("portfolios", {
        portfolios: mockPortfolios,
      });
    });
  });

  describe("viewPortfolio", () => {
    it("should render portfolio view when portfolio exists", async () => {
      const mockPortfolio = { id: 1, user_id: 1, name: "Test Portfolio" };
      const mockAssets = [{ id: 1, name: "Test Asset" }];
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      getAssetsByPortfolioId.mockResolvedValue(mockAssets);

      await viewPortfolio(req, res);

      expect(Portfolio.findOne).toHaveBeenCalledWith({
        where: { id: "1", user_id: 1 },
      });
      expect(getAssetsByPortfolioId).toHaveBeenCalledWith("1");
      expect(res.render).toHaveBeenCalledWith("view_portfolio", {
        portfolio: mockPortfolio,
        portfolioItems: mockAssets,
      });
    });

    it("should redirect when portfolio not found", async () => {
      Portfolio.findOne.mockResolvedValue(null);

      await viewPortfolio(req, res);

      expect(req.flash).toHaveBeenCalledWith("error", "Portfolio not found.");
      expect(res.redirect).toHaveBeenCalledWith("/portfolios");
    });
  });

  describe("assetCurrentPrice", () => {
    it("should return current price for valid symbol", async () => {
      req.query.symbol = "AAPL";
      yahooFinance.quote.mockResolvedValue({ regularMarketPrice: 150.25 });

      await assetCurrentPrice(req, res);

      expect(yahooFinance.quote).toHaveBeenCalledWith("AAPL");
      expect(res.json).toHaveBeenCalledWith({ price: 150.25 });
    });

    it("should return error when yahoo finance fails", async () => {
      req.query.symbol = "INVALID";
      yahooFinance.quote.mockRejectedValue(new Error("Symbol not found"));

      await assetCurrentPrice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });

  describe("renderBuyAsset", () => {
    it("should render buy asset page", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);

      await renderBuyAsset(req, res);

      expect(Portfolio.findOne).toHaveBeenCalledWith({
        where: { id: "1", user_id: 1 },
      });
      expect(res.render).toHaveBeenCalledWith("buy_asset", {
        portfolio: mockPortfolio,
      });
    });
  });

  describe("buyAsset", () => {
    beforeEach(() => {
      req.body = {
        assetName: "Apple Inc",
        assetTicker: "AAPL",
        assetType: "stock",
        quantity: "10",
        buyPrice: "150.00",
      };
    });

    it("should successfully buy asset with ticker", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      yahooFinance.quote.mockResolvedValue({ regularMarketPrice: 152.0 });
      Asset.create.mockResolvedValue({ id: 1 });

      await buyAsset(req, res);

      expect(Asset.create).toHaveBeenCalledWith({
        user_id: 1,
        name: "Apple Inc",
        ticker: "AAPL",
        category: "stock",
        quantity: 10,
        buy_price: 150.0,
        current_price: 152.0,
        currency: "USD",
        type: "buy",
        portfolio_id: 1,
      });
      expect(req.flash).toHaveBeenCalledWith(
        "notice",
        "Asset purchased successfully!"
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolios/1");
    });

    it("should buy asset without ticker", async () => {
      req.body.assetTicker = "";
      const mockPortfolio = { id: 1, user_id: 1 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      Asset.create.mockResolvedValue({ id: 1 });

      await buyAsset(req, res);

      expect(Asset.create).toHaveBeenCalledWith({
        user_id: 1,
        name: "Apple Inc",
        ticker: "N/A",
        category: "stock",
        quantity: 10,
        buy_price: 150.0,
        current_price: 0,
        currency: "USD",
        type: "buy",
        portfolio_id: 1,
      });
    });

    it("should redirect when portfolio not found", async () => {
      Portfolio.findOne.mockResolvedValue(null);

      await buyAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith("error", "Portfolio not found.");
      expect(res.redirect).toHaveBeenCalledWith("/portfolios");
    });

    it("should handle asset creation error", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      yahooFinance.quote.mockResolvedValue({ regularMarketPrice: 152.0 });
      Asset.create.mockRejectedValue(new Error("Database error"));

      await buyAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Error purchasing asset. Please try again."
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolio/1/buy-asset");
    });
  });

  describe("renderSellAsset", () => {
    it("should render sell asset page", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      const mockAssets = [{ id: 1, name: "Test Asset" }];
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      getAssetsByPortfolioId.mockResolvedValue(mockAssets);

      await renderSellAsset(req, res);

      expect(Portfolio.findOne).toHaveBeenCalledWith({
        where: { id: "1", user_id: 1 },
      });
      expect(getAssetsByPortfolioId).toHaveBeenCalledWith(1);
      expect(res.render).toHaveBeenCalledWith("sell_asset", {
        portfolio: mockPortfolio,
        assets: mockAssets,
      });
    });
  });

  describe("sellAsset", () => {
    beforeEach(() => {
      req.body = {
        asset_id: "1",
        quantity: "5",
        price: "155.00",
      };
    });

    it("should successfully sell asset", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      const mockAsset = { id: 1, quantity: 10 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      Asset.findOne.mockResolvedValue(mockAsset);
      Asset.update.mockResolvedValue([1]);

      await sellAsset(req, res);

      expect(Asset.update).toHaveBeenCalledWith(
        { quantity: 5, type: "sell" },
        { where: { id: "1" } }
      );
      expect(req.flash).toHaveBeenCalledWith(
        "notice",
        "Asset sold successfully!"
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolios/1");
    });

    it("should redirect when portfolio not found", async () => {
      Portfolio.findOne.mockResolvedValue(null);

      await sellAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith("error", "Portfolio not found.");
      expect(res.redirect).toHaveBeenCalledWith("/portfolios");
    });

    it("should redirect when asset not found", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      Asset.findOne.mockResolvedValue(null);

      await sellAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith("error", "Portfolio not found.");
      expect(res.redirect).toHaveBeenCalledWith("/portfolios");
    });

    it("should reject sale when insufficient quantity", async () => {
      req.body.quantity = "15";
      const mockPortfolio = { id: 1, user_id: 1 };
      const mockAsset = { id: 1, quantity: 10 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      Asset.findOne.mockResolvedValue(mockAsset);

      await sellAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Insufficient asset quantity."
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolios/1/sell-asset");
      expect(Asset.update).not.toHaveBeenCalled();
    });

    it("should handle database error during sale", async () => {
      const mockPortfolio = { id: 1, user_id: 1 };
      const mockAsset = { id: 1, quantity: 10 };
      Portfolio.findOne.mockResolvedValue(mockPortfolio);
      Asset.findOne.mockResolvedValue(mockAsset);
      Asset.update.mockRejectedValue(new Error("Database error"));

      await sellAsset(req, res);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Error selling asset. Please try again."
      );
      expect(res.redirect).toHaveBeenCalledWith("/portfolios/1/sell-asset");
    });
  });
});
