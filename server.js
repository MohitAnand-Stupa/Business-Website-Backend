require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/db");
const startCronJobs = require("./src/config/cron");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.sync();
    console.log("Database connected");

    startCronJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
