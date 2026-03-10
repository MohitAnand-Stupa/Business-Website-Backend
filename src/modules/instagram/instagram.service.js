const axios = require("axios");
const Post = require("../../models/post.model");

const fetchInstagramPosts = async () => {
  try {
    const url = `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_USER_ID}/media`;

    const response = await axios.get(url, {
      params: {
        fields: "id,caption,media_type,media_url,permalink,timestamp",
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    });

    const posts = response.data.data;

    // Filter only IMAGE type
    const imagePosts = posts
      .filter((post) => post.media_type === "IMAGE")
      .slice(0, 10);

    for (const post of imagePosts) {
      await Post.findOrCreate({
        where: { post_id: post.id },
        defaults: {
          platform: "instagram",
          post_id: post.id,
          caption: post.caption,
          media_url: post.media_url,
          permalink: post.permalink,
          media_type: post.media_type,
          timestamp: post.timestamp,
        },
      });
    }

    console.log("Instagram posts saved successfully");
  } catch (error) {
    console.log("Full Error:", error.response?.data);
  }
};

module.exports = { fetchInstagramPosts };
