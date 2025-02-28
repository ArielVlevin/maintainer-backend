import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { scheduleTaskResetJob } from "./services/taskCron";
import logger from "./utils/logger";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

connectDB();

// ✅ Start background cron jobs
scheduleTaskResetJob();

// ✅ Start Express Server
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

process.on("SIGINT", async () => {
  logger.info("🛑 Server shutting down...");
  await disconnectDB();
  process.exit();
});
