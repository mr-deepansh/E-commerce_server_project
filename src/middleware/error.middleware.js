// src/middleware/error.middleware.js
import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

const IS_PROD = process.env.NODE_ENV === "production";

const reqCtx = (req) => ({
  method: req.method,
  url: req.originalUrl,
  ip: req.ip,
  requestId: req.requestId || null,
});

export const errorHandler = (err, req, res, next) => {
  const ctx = reqCtx(req);
  const baseMeta = {
    ...ctx,
    errorType: err.code || err.name,
  };
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error("[ApiError] Non-operational", {
        ...baseMeta,
        message: err.message,
        statusCode: err.statusCode,
        stack: IS_PROD ? undefined : err.stack,
      });
    } else {
      logger.warn(`[ApiError] ${err.code}: ${err.message}`, {
        ...baseMeta,
        statusCode: err.statusCode,
      });
    }
    const body = {
      success: false,
      code: err.code,
      message: err.message,
    };
    if (err.details != null) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }
  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn("[Mongoose] ValidationError", {
      ...baseMeta,
      statusCode: 422,
      details,
    });

    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    logger.warn("[Mongoose] CastError", { ...ctx, path: err.path, value: err.value });
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: `Invalid value for field: ${err.path}`,
    });
  }
  if (err.code === 11000) {
    const keyObj = err.keyValue || {};
    const fields = Object.keys(keyObj);
    const details = fields.map((field) => ({
      field,
      message: `${field} already exists`,
    }));
    logger.warn("[Mongoose] Duplicate key", { ...ctx, fields });
    return res.status(409).json({
      success: false,
      code: "CONFLICT",
      message: "Duplicate field value",
      details,
    });
  }
  if (err.name === "JsonWebTokenError") {
    logger.warn("[JWT] Invalid token", ctx);
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
  if (err.name === "TokenExpiredError") {
    logger.warn("[JWT] Token expired", ctx);
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Session expired, please log in again",
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    logger.warn("[BodyParser] Invalid JSON", ctx);
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: "Invalid JSON format in request body",
    });
  }
  if (err.type === "entity.too.large" || err.status === 413) {
    logger.warn("[BodyParser] Payload too large", ctx);
    return res.status(413).json({
      success: false,
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body exceeds the allowed size limit",
    });
  }
  logger.error("[Unhandled] Unexpected error", {
    ...ctx,
    name: err.name,
    message: err.message,
    stack: IS_PROD ? undefined : err.stack,
  });
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: IS_PROD ? "Something went wrong. Please try again later." : err.message,
  });
};
