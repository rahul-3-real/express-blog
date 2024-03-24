import { Router } from "express";
import {
  becomeAuthorController,
  forgotPasswordController,
  forgotPasswordRequestController,
  loginController,
  logoutController,
  registerController,
  resendVerifyAccountLinkController,
  resetPasswordController,
  verifyAccountController,
} from "../controllers/user.controllers.js";
import { isUserVerified, verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").post(verifyJWT, logoutController);
router.route("/verify-account").get(verifyAccountController);
router.route("/resend-verify-account").post(resendVerifyAccountLinkController);
router.route("/forgot-password").post(forgotPasswordController);
router.route("/forgot-password-request").post(forgotPasswordRequestController);
router.route("/reset-password").post(verifyJWT, resetPasswordController);
router
  .route("/change-role")
  .post(verifyJWT, isUserVerified, becomeAuthorController);

export default router;
