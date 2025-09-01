// const {
//   seq,
//   User,
//   Portfolio,
//   Asset,
//   getPortfoliosByUserId,
//   getAssetsByPortfolioId,
//   getAssetsByCategory,
//   getAssetsByTicker,
//   getAssetsByType,
//   createUser,
//   getUserByEmail,
//   changeAssetType,
//   deleteAssetIfSold,
//   deletePortfolioIfEmpty,
//   createNewPortfolio,
// } = require("../models/model");

// // Mock Sequelize models
// jest.mock("sequelize");

// describe("Model Functions", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("getPortfoliosByUserId", () => {
//     it("should return portfolios for a given user ID", async () => {
//       const mockPortfolios = [{ id: 1, user_id: 1, name: "Test Portfolio" }];
//       Portfolio.findAll = jest.fn().mockResolvedValue(mockPortfolios);

//       const result = await getPortfoliosByUserId(1);

//       expect(Portfolio.findAll).toHaveBeenCalledWith({ where: { user_id: 1 } });
//       expect(result).toEqual(mockPortfolios);
//     });
//   });

//   describe("getAssetsByPortfolioId", () => {
//     it("should return assets for a given portfolio ID", async () => {
//       const mockAssets = [{ id: 1, portfolio_id: 1, ticker: "AAPL" }];
//       Asset.findAll = jest.fn().mockResolvedValue(mockAssets);

//       const result = await getAssetsByPortfolioId(1);

//       expect(Asset.findAll).toHaveBeenCalledWith({
//         where: { portfolio_id: 1 },
//       });
//       expect(result).toEqual(mockAssets);
//     });
//   });

//   describe("getAssetsByCategory", () => {
//     it("should return assets filtered by category", async () => {
//       const mockAssets = [{ id: 1, portfolio_id: 1, category: "stocks" }];
//       Asset.findAll = jest.fn().mockResolvedValue(mockAssets);

//       const result = await getAssetsByCategory(1, "stocks");

//       expect(Asset.findAll).toHaveBeenCalledWith({
//         where: { portfolio_id: 1, category: "stocks" },
//       });
//       expect(result).toEqual(mockAssets);
//     });
//   });

//   describe("getAssetsByTicker", () => {
//     it("should return assets filtered by ticker", async () => {
//       const mockAssets = [{ id: 1, portfolio_id: 1, ticker: "AAPL" }];
//       Asset.findAll = jest.fn().mockResolvedValue(mockAssets);

//       const result = await getAssetsByTicker(1, "AAPL");

//       expect(Asset.findAll).toHaveBeenCalledWith({
//         where: { portfolio_id: 1, ticker: "AAPL" },
//       });
//       expect(result).toEqual(mockAssets);
//     });
//   });

//   describe("getAssetsByType", () => {
//     it("should return assets filtered by type", async () => {
//       const mockAssets = [{ id: 1, portfolio_id: 1, type: "buy" }];
//       Asset.findAll = jest.fn().mockResolvedValue(mockAssets);

//       const result = await getAssetsByType(1, "buy");

//       expect(Asset.findAll).toHaveBeenCalledWith({
//         where: { portfolio_id: 1, type: "buy" },
//       });
//       expect(result).toEqual(mockAssets);
//     });
//   });

//   describe("createUser", () => {
//     it("should create a new user", async () => {
//       const mockUser = {
//         id: 1,
//         email: "test@test.com",
//         hashed_pass: "hash123",
//       };
//       User.create = jest.fn().mockResolvedValue(mockUser);

//       const result = await createUser("test@test.com", "hash123");

//       expect(User.create).toHaveBeenCalledWith({
//         email: "test@test.com",
//         hashed_pass: "hash123",
//       });
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe("getUserByEmail", () => {
//     it("should return user by email", async () => {
//       const mockUser = { id: 1, email: "test@test.com" };
//       User.findOne = jest.fn().mockResolvedValue(mockUser);

//       const result = await getUserByEmail("test@test.com");

//       expect(User.findOne).toHaveBeenCalledWith({
//         where: { email: "test@test.com" },
//       });
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe("changeAssetType", () => {
//     it("should update asset type", async () => {
//       Asset.update = jest.fn().mockResolvedValue([1]);

//       const result = await changeAssetType(1, "sell");

//       expect(Asset.update).toHaveBeenCalledWith(
//         { type: "sell" },
//         { where: { id: 1 } }
//       );
//       expect(result).toEqual([1]);
//     });
//   });

//   describe("deleteAssetIfSold", () => {
//     it("should delete asset if type is sell", async () => {
//       const mockAsset = { id: 1, type: "sell" };
//       Asset.findOne = jest.fn().mockResolvedValue(mockAsset);
//       Asset.destroy = jest.fn().mockResolvedValue(1);

//       const result = await deleteAssetIfSold(1);

//       expect(Asset.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//       expect(Asset.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
//       expect(result).toBe(1);
//     });

//     it("should not delete asset if type is not sell", async () => {
//       const mockAsset = { id: 1, type: "buy" };
//       Asset.findOne = jest.fn().mockResolvedValue(mockAsset);
//       Asset.destroy = jest.fn();

//       const result = await deleteAssetIfSold(1);

//       expect(Asset.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//       expect(Asset.destroy).not.toHaveBeenCalled();
//       expect(result).toBe(0);
//     });

//     it("should return 0 if asset not found", async () => {
//       Asset.findOne = jest.fn().mockResolvedValue(null);
//       Asset.destroy = jest.fn();

//       const result = await deleteAssetIfSold(1);

//       expect(Asset.destroy).not.toHaveBeenCalled();
//       expect(result).toBe(0);
//     });
//   });

//   describe("deletePortfolioIfEmpty", () => {
//     it("should delete portfolio if no assets", async () => {
//       Asset.findAll = jest.fn().mockResolvedValue([]);
//       Portfolio.destroy = jest.fn().mockResolvedValue(1);

//       const result = await deletePortfolioIfEmpty(1);

//       expect(Portfolio.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
//       expect(result).toBe(1);
//     });

//     it("should not delete portfolio if assets exist", async () => {
//       const mockAssets = [{ id: 1, portfolio_id: 1 }];
//       Asset.findAll = jest.fn().mockResolvedValue(mockAssets);
//       Portfolio.destroy = jest.fn();

//       const result = await deletePortfolioIfEmpty(1);

//       expect(Portfolio.destroy).not.toHaveBeenCalled();
//       expect(result).toBe(0);
//     });

//     it("should delete portfolio if assets is null", async () => {
//       Asset.findAll = jest.fn().mockResolvedValue(null);
//       Portfolio.destroy = jest.fn().mockResolvedValue(1);

//       const result = await deletePortfolioIfEmpty(1);

//       expect(Portfolio.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
//       expect(result).toBe(1);
//     });
//   });

//   describe("createNewPortfolio", () => {
//     it("should create a new portfolio", async () => {
//       const mockPortfolio = {
//         id: 1,
//         user_id: 1,
//         name: "Test",
//         description: "Desc",
//       };
//       Portfolio.create = jest.fn().mockResolvedValue(mockPortfolio);

//       const result = await createNewPortfolio(1, "Test", "Desc");

//       expect(Portfolio.create).toHaveBeenCalledWith({
//         user_id: 1,
//         name: "Test",
//         description: "Desc",
//       });
//       expect(result).toEqual(mockPortfolio);
//     });
//   });
// });
