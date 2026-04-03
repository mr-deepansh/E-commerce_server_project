import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const validate =
  (DTOorSchema, source = "body") =>
  (req, res, next) => {
    try {
      const schema = DTOorSchema?.schema ?? DTOorSchema;
      const target = req[source];
      if (target === undefined) {
        logger.warn("[validate] Missing request source", {
          source,
          method: req.method,
          path: req.path,
        });
        return next(ApiError.badRequest(`Request ${source} is missing`));
      }
      const result = schema.safeParse(target);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join(".") || null,
          message: issue.message,
        }));
        logger.warn("[validate] Validation failed", {
          source,
          method: req.method,
          path: req.path,
          details,
        });
        return next(ApiError.validationError("Validation failed", details));
      }
      req[source] = result.data;
      return next();
    } catch (err) {
      logger.error("[validate] Unexpected error", {
        error: err.message,
        stack: err.stack,
        source,
        path: req.path,
      });
      return next(ApiError.internal("Request validation error"));
    }
  };
