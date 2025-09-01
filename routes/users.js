const express = require("express");
const { md5 } = require("js-md5");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../models/model");
const { redirectIfAuthenticated } = require("../middleware/auth");

router.get("/register", redirectIfAuthenticated, (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/register");
  }

  const newUser = new User({ email, hashed_pass: md5(password) });

  try {
    await newUser.save();
    req.flash("notice", "Registration successful, please log in.");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Error registering user.");
    res.render("register");
  }
});

router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email, hashed_pass: md5(password) },
  });

  if (!user) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("login");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );

  req.flash("notice", "Welcome back!");
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("notice", "Logged out successfully.");
  res.redirect("/login");
});

module.exports = router;
