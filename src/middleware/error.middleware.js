import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, _next) => {
  const request = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  };
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error("Non-operational error", {
        ...request,
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
    } else {
      logger.warn(`[${err.code}] Validation failed`, { ...request, message: err.message });
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    });
  }
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn("Mongoose validation failed", { ...request, details });
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    logger.warn("Duplicate key error", { ...request, field });
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: "DUPLICATE_KEY",
    });
  }
  if (err.name === "JsonWebTokenError") {
    logger.warn("Invalid token", request);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
  if (err.name === "TokenExpiredError") {
    logger.warn("Token expired", request);
    return res.status(401).json({
      success: false,
      message: "Token has expired",
      code: "TOKEN_EXPIRED",
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    logger.warn("Invalid JSON", request);
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
      code: "INVALID_JSON",
    });
  }
  logger.error("Unhandled error", {
    ...request,
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
};
