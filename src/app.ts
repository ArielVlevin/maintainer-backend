import express, { Application } from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import { setupRoutes } from "./config/setupRoutes";
import { setupMiddlewares } from "./config/setupMiddlewares";

dotenv.config();

// ✅ Create Express App
const app: Application = express();

// ✅ Setup Middlewares
setupMiddlewares(app);

// ✅ Setup Routes
setupRoutes(app);

// ✅ Global Error Handler
app.use(errorHandler);

export default app;
