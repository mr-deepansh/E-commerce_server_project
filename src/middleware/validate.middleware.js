//src/middleware/validate.middleware.js
import { z } from "zod";
import ApiError from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const validate = (schemas = {}) => {
  return (req, res, next) => {
    const errors = [];
    const { body: bodySchema, params: paramsSchema, query: querySchema } = schemas;
    const targets = [
      { key: "body", schema: bodySchema, data: req.body },
      { key: "params", schema: paramsSchema, data: req.params },
      { key: "query", schema: querySchema, data: req.query },
    ];
    for (const { key, schema, data } of targets) {
      if (!schema) continue;
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: issue.path.length > 0 ? issue.path.join(".") : key,
            message: issue.message,
          });
        }
      } else {
        req[key] = result.data;
      }
    }
    if (errors.length > 0) {
      logger.warn(`Validation failed for ${req.method} ${req.path}`, { errors });
      return next(ApiError.validationError("Validation failed", errors));
    }
    return next();
  };
};
