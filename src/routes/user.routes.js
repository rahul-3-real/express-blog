import { Router } from "express";
import {
  becomeAuthorController,
  forgotPasswordController,
  forgotPasswordRequestController,
  getUserProfile,
  loginController,
  logoutController,
  registerController,
  removeAvatarImageController,
  removeCoverImageController,
  resendVerifyAccountLinkController,
  resetPasswordController,
  updateUserProfile,
  uploadAvatarImageController,
  uploadCoverImageController,
  verifyAccountController,
} from "../controllers/user.controllers.js";
import uploadMiddleware from "../middlewares/multer.middlewares.js";
import { isUserVerified, verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Upload folders
const avatarUpload = uploadMiddleware("avatar");
const coverImageUpload = uploadMiddleware("cover-image");

// Routes
router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").post(verifyJWT, logoutController);
router.route("/verify-account").get(verifyAccountController);
router.route("/resend-verify-account").patch(resendVerifyAccountLinkController);
router.route("/forgot-password").post(forgotPasswordController);
router.route("/forgot-password-request").patch(forgotPasswordRequestController);
router.route("/reset-password").patch(verifyJWT, resetPasswordController);
router
  .route("/become-author")
  .patch(verifyJWT, isUserVerified, becomeAuthorController);
router
  .route("/upload-avatar")
  .patch(avatarUpload.single("avatar"), verifyJWT, uploadAvatarImageController);
router.route("/remove-avatar").patch(verifyJWT, removeAvatarImageController);
router
  .route("/upload-cover-image")
  .patch(
    coverImageUpload.single("coverImage"),
    verifyJWT,
    uploadCoverImageController
  );
router
  .route("/remove-cover-image")
  .patch(verifyJWT, removeCoverImageController);
router.route("/profile/:username").get(getUserProfile);
router.route("/update-profile").patch(verifyJWT, updateUserProfile);

export default router;
