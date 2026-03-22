class ApiError extends Error {
  constructor({
    statusCode = 500,
    message = "Internal Server Error",
    code = "INTERNAL_ERROR",
    details = null,
    isOperational = true,
  }) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.success = false;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", details = null) {
    return new ApiError({ statusCode: 400, message, code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError({ statusCode: 401, message, code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Forbidden") {
    return new ApiError({ statusCode: 403, message, code: "FORBIDDEN" });
  }

  static conflict(message = "Conflict") {
    return new ApiError({ statusCode: 409, message, code: "CONFLICT" });
  }

  static notFound(message = "Not Found") {
    return new ApiError({ statusCode: 404, message, code: "NOT_FOUND" });
  }

  static validationError(message = "Validation Error", details = null) {
    return new ApiError({ statusCode: 422, message, code: "VALIDATION_ERROR", details });
  }

  static internal(message = "Internal Server Error") {
    return new ApiError({
      statusCode: 500,
      message,
      code: "INTERNAL_ERROR",
      isOperational: false,
    });
  }
}

export default ApiError;
