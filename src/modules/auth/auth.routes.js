import express from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import * as authController from "./auth.controller.js";
import { RegisterDTO, LoginDTO, VerifyEmailDTO } from "./dto/index.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  // Optionally key by IP + identifier to limit per-account globally:
  // keyGenerator: (req) => `${req.ip}:${req.body?.identifier ?? ""}`,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── public routes ──────────────────── */

router.post("/register", registerLimiter, validate(RegisterDTO), authController.register);

router.post("/login", loginLimiter, validate(LoginDTO), authController.login);

router.post("/refresh", refreshLimiter, authController.refreshToken);

router.get("/verify-email", validate(VerifyEmailDTO, "query"), authController.verifyEmail);

/* ─── protected routes ──────────────────── */
router.post("/logout", authenticate, authController.logout);

export default router;
