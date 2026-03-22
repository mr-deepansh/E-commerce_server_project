// src/modules/auth/auth.route.js
import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema.js";

const router = express.Router();

router.post("/register", validate({ body: registerSchema }), authController.register);

// router.post(
//   "/login",
//   validate({ body: loginSchema }),
//   authController.login);

// router.post(
//   "/forgot-password",
//   validate({ body: forgotPasswordSchema }),
//   authController.forgotPassword
// );

// router.post(
//   "/reset-password",
//   validate({ body: resetPasswordSchema }),
//   authController.resetPassword
// );

export default router;
