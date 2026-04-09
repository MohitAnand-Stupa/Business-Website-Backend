const Post = require("../../models/post.model");

const getInstagramPosts = async (req, res) => {
  console.log("printing")
  try {
    const posts = await Post.findAll({
      where: { platform: "instagram" },
      order: [["timestamp", "DESC"]],
      limit: 10,
    });
    console.log("result", posts);
    res.json(posts);

  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

module.exports = { getInstagramPosts };
