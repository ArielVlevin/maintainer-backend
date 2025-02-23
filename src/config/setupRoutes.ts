import { Application } from "express";
import productRoutes from "../routes/productRoutes";
import taskRoutes from "../routes/taskRoutes";
import uploadRoutes from "../routes/upload";
import authRoutes from "../routes/authRoutes";
import calendarRoutes from "../routes/calendarRoutes";
/**
 * @function setupRoutes
 * @description Configures all application routes.
 * @param {Application} app - The Express application instance.
 */
export const setupRoutes = (app: Application) => {
  app.use("/api/products", productRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/calendar", calendarRoutes);

  /**
   * @route Any
   * @description Handles non-existing routes and returns a 404 error
   */
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
};
