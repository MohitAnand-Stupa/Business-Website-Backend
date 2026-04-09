const express = require("express");
const router = express.Router();
const { getInstagramPosts } = require("../modules/instagram/instagram.controller");
const { fetchInstagramPosts } = require("../modules/instagram/instagram.service");

router.get("/instagram", getInstagramPosts);

router.post("/instagram/fetch", async (req, res) => {
  try {
    const result = await fetchInstagramPosts();
    res.json({
      message: "Posts fetched and stored successfully",
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch Instagram posts",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;
