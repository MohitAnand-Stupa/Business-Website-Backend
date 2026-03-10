const cron = require("node-cron");
const { fetchInstagramPosts } = require("../modules/instagram/instagram.service");

const startCronJobs = () => {
  // Runs at 12:00 AM every day
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily Instagram fetch job...");
    await fetchInstagramPosts();
  });
};

module.exports = startCronJobs;
