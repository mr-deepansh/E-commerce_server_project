import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const validate = (DTOorSchema) => (req, res, next) => {
  try {
    const schema = DTOorSchema?.schema ?? DTOorSchema;
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || null,
        message: issue.message,
      }));
      logger.warn("[validate] Validation failed", {
        method: req.method,
        path: req.path,
        details,
      });
      return next(ApiError.validationError("Validation failed", details));
    }
    req.body = result.data;
    return next();
  } catch (err) {
    logger.error("[validate] Unexpected error in validate middleware", {
      error: err.message,
      stack: err.stack,
      path: req.path,
    });
    return next(ApiError.internal("Request validation error"));
  }
};
