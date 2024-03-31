import { Router } from "express";
import {
  verifyJWT,
  isAuthor,
  isAuthorized,
} from "../middlewares/auth.middlewares.js";
import { getAllPostsController } from "../controllers/post.controllers.js";

const router = Router();

// Routes
router.route("/").get(getAllPostsController);

export default router;
