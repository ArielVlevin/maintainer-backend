import { Router } from "express";
import {
  createProductHandler,
  getProductsHandler,
  updateProductHandler,
  deleteProductHandler,
  getCategoriesHandler,
} from "../controllers/productController";
import {
  ensureEmailVerified,
  verifyToken,
} from "../middlewares/authMiddleware";
import { requestLogger } from "../middlewares/requestLogger";

const router = Router();

router.use(verifyToken);
router.use(ensureEmailVerified);

// todo:repair:router.use(requestLogger);

router.post("/", createProductHandler);

router.get("/", getProductsHandler);

router.get("/categories", getCategoriesHandler);

router.put("/:product_id", updateProductHandler);
router.delete("/:product_id", deleteProductHandler);

export default router;
