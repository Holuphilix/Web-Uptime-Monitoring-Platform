const cron = require("node-cron");
const { getAllUrls } = require("../db/queries");
const { monitorUrl } = require("../services/monitorService");

function startScheduler() {
  console.log("🚀 Background monitoring started...");

  cron.schedule("* * * * *", async () => {
    console.log("⏱ Running scheduled monitoring...");

    try {
      const urls = await getAllUrls();

      for (const urlObj of urls) {
        await monitorUrl(urlObj.url);
      }

    } catch (error) {
      console.error("❌ Scheduler error:", error.message);
    }
  });
}

module.exports = { startScheduler };