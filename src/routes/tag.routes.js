import { Router } from "express";
import {
  createTagController,
  deleteTagController,
  getTagController,
  getTagsController,
  updateTagController,
} from "../controllers/tag.controllers.js";
import {
  verifyJWT,
  isAuthor,
  isAuthorized,
} from "../middlewares/auth.middlewares.js";

const router = Router();

// Routes
router.route("/").get(getTagsController);
router.route("/").post(verifyJWT, isAuthor, createTagController);
router.route("/:_id").get(getTagController);
router
  .route("/:_id")
  .patch(verifyJWT, isAuthor, isAuthorized("Tag"), updateTagController);
router
  .route("/:_id")
  .delete(verifyJWT, isAuthor, isAuthorized("Tag"), deleteTagController);

export default router;
