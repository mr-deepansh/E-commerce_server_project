// src/modules/auth/auth.route.js
import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";
import { RegisterDTO, LoginDTO } from "./dto/index.js";

const router = express.Router();

router.post("/register", validate(RegisterDTO), authController.register);
router.post("/login", validate(LoginDTO), authController.login);

export default router;
