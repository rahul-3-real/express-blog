import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/logout").post(verifyJWT, logoutController);

export default router;
