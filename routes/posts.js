const router = require("express").Router();
const Post = require("../models/Post");
const { ensureAuth } = require("../auth/authMiddleware");

router.get("/add", ensureAuth, (req, res) => {
  res.render("posts/add");
});

router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Post.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.get("/", ensureAuth, async (req, res) => {
  try {
    const posts = await Post.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: -1 })
      .lean();

    res.render("posts/index", {
      posts,
    });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user").lean();
    if (!post) {
      return res.render("error/404");
    } else {
      res.render("posts/show", {
        post,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error/404");
  }
});

router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) {
      return res.render("error/404");
    } else if (post.user != req.user.id) {
      res.redirect("/posts");
    } else {
      res.render("posts/edit", {
        post,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).lean();
    if (!post) {
      return res.render("error/404");
    } else if (post.user != req.user.id) {
      res.redirect("/posts");
    } else {
      post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Post.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.redirect("error/500");
  }
});

router.get("/user/:id", ensureAuth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id, status: "public" })
      .populate("user")
      .lean();
    if (!posts) {
      return res.render("error/404");
    } else {
      res.render("posts/index", {
        posts,
      });
    }
  } catch (error) {
    console.log(error);
    res.render("error/404");
  }
});

module.exports = router;
