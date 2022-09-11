const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/login", (req, res) => {
  return res.redirect("/google/callback");
});

router.get(
  "/google",
  passport.authenticate(
    "google",
    { scope: ["profile"] },
    { failureRedirect: "/" }
  )
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    return res.redirect("/");
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/");
  });
});

module.exports = router;
