import { Router } from "express";
import {
  verifyJWT,
  isAuthor,
  isAuthorized,
} from "../middlewares/auth.middlewares.js";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController,
} from "../controllers/category.controllers.js";

const router = Router();

// Routes
router.route("/").get(getCategoriesController);
router.route("/:_id").get(getCategoryController);
router.route("/").post(verifyJWT, isAuthor, createCategoryController);
router
  .route("/:_id")
  .patch(
    verifyJWT,
    isAuthor,
    isAuthorized("Category"),
    updateCategoryController
  );
router
  .route("/:_id")
  .delete(
    verifyJWT,
    isAuthor,
    isAuthorized("Category"),
    deleteCategoryController
  );

export default router;
