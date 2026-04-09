const axios = require("axios");
const Post = require("../../models/post.model");

const GRAPH_API_BASE = "https://graph.facebook.com/v18.0";
const DEBUG_INSTAGRAM_FETCH = process.env.INSTAGRAM_DEBUG === "true";

const ensureEnv = () => {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    throw new Error("Missing INSTAGRAM_ACCESS_TOKEN");
  }

  if (!process.env.INSTAGRAM_USER_ID) {
    throw new Error("Missing INSTAGRAM_USER_ID");
  }
};

const fetchMediaById = async (instagramAccountId) => {
  let allPosts = [];
  let url = `${GRAPH_API_BASE}/${instagramAccountId}/media`;
  let pageCount = 0;

  while (url && pageCount < 3) {
    const response = await axios.get(url, {
      params: {
        fields: "id,caption,media_type,media_url,permalink,timestamp",
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      },
    });

    const { data, paging } = response.data;
    if (data) {
      allPosts = allPosts.concat(data);
    }

    // Check for the next page and increment count
    url = paging?.next;
    pageCount++;
  }

  return { data: { data: allPosts } }; // Mimic original single-page response structure
};

const resolveInstagramBusinessAccountId = async (pageId) => {
  const url = `${GRAPH_API_BASE}/${pageId}`;

  const response = await axios.get(url, {
    params: {
      fields: "instagram_business_account{id}",
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
    },
  });

  return response.data?.instagram_business_account?.id;
};

const fetchInstagramPosts = async () => {
  console.log("Fetching Instagram posts...");
  ensureEnv();

  try {
    let response;

    try {
      response = await fetchMediaById(process.env.INSTAGRAM_USER_ID);
    } catch (error) {
      const isInvalidMediaEdge =
        error.response?.data?.error?.code === 100 &&
        String(error.response?.data?.error?.message || "").includes("field (media)");

      if (!isInvalidMediaEdge) {
        throw error;
      }

      // If INSTAGRAM_USER_ID is actually a Facebook Page ID, resolve the linked IG Business Account ID.
      const igBusinessAccountId = await resolveInstagramBusinessAccountId(
        process.env.INSTAGRAM_USER_ID
      );

      if (!igBusinessAccountId) {
        throw new Error(
          "INSTAGRAM_USER_ID looks like a Page ID but has no linked instagram_business_account"
        );
      }

      response = await fetchMediaById(igBusinessAccountId);
    }

    const posts = response.data.data || [];
    console.log(`[Instagram] Total fetched from API: ${posts.length}`);

    // Keep only the latest IMAGE posts from API response.
    const imagePosts = posts
      .filter(
        (post) =>
          post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    console.log(`[Instagram] Selected recent image posts: ${imagePosts.length}`);

    if (DEBUG_INSTAGRAM_FETCH) {
      console.log("[Instagram] Selected post IDs (newest first):", imagePosts.map((p) => p.id));
      console.log(
        "[Instagram] Selected post timestamps:",
        imagePosts.map((p) => `${p.id} => ${p.timestamp}`)
      );
    }

    let insertedCount = 0;
    let existingCount = 0;

    for (const post of imagePosts) {
      const [, created] = await Post.findOrCreate({
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

      if (created) {
        console.log("created", created)
        insertedCount += 1;
      } else {
        existingCount += 1;
      }

      if (DEBUG_INSTAGRAM_FETCH) {
        console.log(
          `[Instagram] ${created ? "INSERTED" : "SKIPPED_EXISTING"}: ${post.id} (${post.timestamp})`
        );
      }
    }

    console.log(
      `[Instagram] Sync complete. inserted=${insertedCount}, skipped_existing=${existingCount}`
    );
    return {
      fetched: posts.length,
      selected: imagePosts.length,
      saved: insertedCount,
      skippedExisting: existingCount,
    };
  } catch (error) {
    console.log("Full Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { fetchInstagramPosts };
