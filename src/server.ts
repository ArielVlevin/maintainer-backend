import app from "./app";
import { scheduleTaskResetJob } from "./services/taskCron";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// ✅ Start background cron jobs
scheduleTaskResetJob();

// ✅ Start Express Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
