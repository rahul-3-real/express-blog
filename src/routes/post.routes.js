import { Router } from "express";
import {
  verifyJWT,
  isAuthor,
  isAuthorized,
} from "../middlewares/auth.middlewares.js";
import uploadMiddleware from "../middlewares/multer.middlewares.js";
import {
  createPostController,
  deletePostController,
  getAllPostsController,
  getPostController,
  updatePostController,
} from "../controllers/post.controllers.js";

const router = Router();

// Upload folders
const postImagesUpload = uploadMiddleware("posts");

// Routes
router.route("/").get(getAllPostsController);
router.route("/:_id").get(getPostController);
router
  .route("/")
  .post(
    verifyJWT,
    isAuthor,
    postImagesUpload.fields([{ name: "featuredImage" }]),
    createPostController
  );
router
  .route("/:_id")
  .patch(verifyJWT, isAuthor, isAuthorized("Post"), updatePostController);
router
  .route("/:_id")
  .delete(verifyJWT, isAuthor, isAuthorized("Post"), deletePostController);

export default router;
