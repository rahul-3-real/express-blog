import { Router } from "express";
import {
  createTagController,
  getTagsController,
} from "../controllers/tag.controllers.js";
import { verifyJWT, isAuthor } from "../middlewares/auth.middlewares.js";

const router = Router();

// Routes
router.route("/").get(getTagsController);
router.route("/").post(verifyJWT, isAuthor, createTagController);

export default router;
