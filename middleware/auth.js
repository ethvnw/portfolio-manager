const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to ensure user is authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const ensureAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.flash("error", "You must be logged in to access that page.");
    return res.redirect("/login");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.flash("error", "Session expired, please log in again.");
      return res.redirect("/login");
    }

    res.locals.email = user.email;
    req.user = user;
    next();
  });
};

/**
 * Middleware to redirect away from route if authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.flash("error", "Session expired, please log in again.");
        return res.redirect("/login");
      }
      return res.redirect("/");
    });
  }
  next();
};

module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated,
};
