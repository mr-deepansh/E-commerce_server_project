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
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON() {
    return {
      success: this.success,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }

  static badRequest(message = "Bad Request", details = null) {
    return new ApiError({ statusCode: 400, message, code: "BAD_REQUEST", details });
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new ApiError({ statusCode: 401, message, code: "UNAUTHORIZED" });
  }

  static forbidden(message = "Forbidden", details = null) {
    return new ApiError({ statusCode: 403, message, code: "FORBIDDEN", details });
  }

  static conflict(message = "Conflict", details = null) {
    return new ApiError({ statusCode: 409, message, code: "CONFLICT", details });
  }

  static notFound(message = "Not Found", details = null) {
    return new ApiError({ statusCode: 404, message, code: "NOT_FOUND", details });
  }

  static validationError(message = "Validation Error", details = null) {
    return new ApiError({ statusCode: 422, message, code: "VALIDATION_ERROR", details });
  }

  static tooManyRequests(message = "Too Many Requests", details = null) {
    return new ApiError({ statusCode: 429, message, code: "TOO_MANY_REQUESTS", details });
  }

  static internal(message = "Internal Server Error", details = null) {
    return new ApiError({
      statusCode: 500,
      message,
      code: "INTERNAL_ERROR",
      isOperational: false,
      details,
    });
  }
}

export default ApiError;
