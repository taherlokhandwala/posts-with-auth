const router = require("express").Router();
const Post = require("../models/Post");
const { ensureAuth, ensureGuest } = require("../auth/authMiddleware");

router.get("/", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.firstName,
      posts,
    });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

module.exports = router;
