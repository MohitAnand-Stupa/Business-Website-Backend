const express = require("express");
const router = express.Router();
const { getInstagramPosts } = require("../modules/instagram/instagram.controller");
const { fetchInstagramPosts } = require("../modules/instagram/instagram.service");

router.get("/instagram", getInstagramPosts);

router.post("/instagram/fetch", async (req, res) => {
  await fetchInstagramPosts();
  res.json({ message: "Posts fetched and stored successfully" });
});

module.exports = router;
