const jwt = require("jsonwebtoken");
const {
  ensureAuthenticated,
  redirectIfAuthenticated,
} = require("../middleware/auth");

// Mock jwt module
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      flash: jest.fn(),
      user: null,
    };
    res = {
      redirect: jest.fn(),
      locals: {},
    };
    next = jest.fn();
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("ensureAuthenticated", () => {
    it("should redirect to login when no token is provided", () => {
      req.cookies = {};

      ensureAuthenticated(req, res, next);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "You must be logged in to access that page."
      );
      expect(res.redirect).toHaveBeenCalledWith("/login");
      expect(next).not.toHaveBeenCalled();
    });

    it("should redirect to login when token is invalid", () => {
      req.cookies.token = "invalid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      ensureAuthenticated(req, res, next);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Session expired, please log in again."
      );
      expect(res.redirect).toHaveBeenCalledWith("/login");
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when token is valid", () => {
      const mockUser = { email: "test@example.com", id: 1 };
      req.cookies.token = "valid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      ensureAuthenticated(req, res, next);

      expect(res.locals.email).toBe(mockUser.email);
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe("redirectIfAuthenticated", () => {
    it("should call next when no token is provided", () => {
      req.cookies = {};

      redirectIfAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should redirect to login when token is invalid", () => {
      req.cookies.token = "invalid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      redirectIfAuthenticated(req, res, next);

      expect(req.flash).toHaveBeenCalledWith(
        "error",
        "Session expired, please log in again."
      );
      expect(res.redirect).toHaveBeenCalledWith("/login");
    });

    it("should redirect to home when token is valid", () => {
      const mockUser = { email: "test@example.com", id: 1 };
      req.cookies.token = "valid-token";
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockUser);
      });

      redirectIfAuthenticated(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith("/");
    });
  });
});
