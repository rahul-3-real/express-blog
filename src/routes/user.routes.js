import { Router } from "express";
import {
  forgotPasswordController,
  forgotPasswordRequestController,
  loginController,
  logoutController,
  registerController,
  resendVerifyAccountLinkController,
  resetPasswordController,
  verifyAccountController,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").post(verifyJWT, logoutController);
router.route("/verify-account").get(verifyAccountController);
router.route("/resend-verify-account").post(resendVerifyAccountLinkController);
router.route("/reset-password").post(verifyJWT, resetPasswordController);
router.route("/forgot-password").post(forgotPasswordController);
router.route("/forgot-password-request").post(forgotPasswordRequestController);

export default router;
