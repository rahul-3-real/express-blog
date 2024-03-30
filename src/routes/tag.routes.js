import { Router } from "express";
import {
  createTagController,
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
router
  .route("/:_id")
  .patch(verifyJWT, isAuthor, isAuthorized("Tag"), updateTagController);

export default router;
