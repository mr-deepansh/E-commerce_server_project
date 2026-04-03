import ApiError from "../../utils/apiError.js";
import apiResponse from "../../utils/apiResponse.js";
import { logger } from "../../utils/logger.js";
import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    logger.info("[AUTH] Register attempt", {
      email: req.body.email,
      username: req.body.username,
      requestId: req.requestId,
    });
    const user = await authService.register(req.body);
    logger.info("[AUTH] Registration successful", { userId: user._id, requestId: req.requestId });
    res
      .status(201)
      .json(
        apiResponse.created(
          user,
          "Registration successful. Check your email to verify your account."
        )
      );
  } catch (err) {
    logger.error("[AUTH] Registration failed", { error: err.message, requestId: req.requestId });
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    logger.info("[AUTH] Login attempt", { identifier, requestId: req.requestId });
    const { accessToken, refreshToken, user } = await authService.login(identifier, password);
    logger.info("[AUTH] Login successful", {
      userId: user._id,
      username: user.username,
      requestId: req.requestId,
    });
    res.json(apiResponse.success({ accessToken, refreshToken, user }, "Login successful"));
  } catch (err) {
    logger.warn("[AUTH] Login failed", {
      identifier: req.body.identifier,
      error: err.message,
      requestId: req.requestId,
    });
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is required");
    }
    logger.info("[AUTH] Token refresh attempt", { requestId: req.requestId });
    const result = await authService.refreshToken(refreshToken);
    logger.info("[AUTH] Token refreshed", { userId: result.user._id, requestId: req.requestId });
    res.json(apiResponse.success(result, "Token refreshed successfully"));
  } catch (error) {
    logger.warn("[AUTH] Token refresh failed", { error: error.message, requestId: req.requestId });
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    logger.info("[AUTH] Logout attempt", { userId: req.user.sub, requestId: req.requestId });
    await authService.logout(req.user.sub);
    logger.info("[AUTH] Logout successful", { userId: req.user.sub, requestId: req.requestId });
    res.json(apiResponse.success(null, "Logged out successfully"));
  } catch (err) {
    logger.error("[AUTH] Logout failed", { error: err.message, requestId: req.requestId });
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      throw ApiError.badRequest("Verification token is required");
    }
    logger.info("[AUTH] Email verification attempt", { requestId: req.requestId });
    const user = await authService.verifyEmail(token);
    logger.info("[AUTH] Email verified", { userId: user._id, requestId: req.requestId });
    res.json(apiResponse.success(user, "Email verified successfully"));
  } catch (err) {
    logger.warn("[AUTH] Email verification failed", {
      error: err.message,
      requestId: req.requestId,
    });
    next(err);
  }
};
