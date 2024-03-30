import { Router } from "express";
import {
  verifyJWT,
  isAuthor,
  isAuthorized,
} from "../middlewares/auth.middlewares.js";
import { getCategoriesController } from "../controllers/category.controllers.js";

const router = Router();

// Routes
router.route("/").get(getCategoriesController);

export default router;
