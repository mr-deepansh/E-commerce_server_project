class ApiResponse {
  constructor({ statusCode = 200, message = "Success", data = null, meta = null }) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success(data, message = "Success", meta = null) {
    return new ApiResponse({ statusCode: 200, message, data, meta });
  }

  static created(data, message = "Created") {
    return new ApiResponse({ statusCode: 201, message, data });
  }

  static fail(message = "Error", statusCode = 500) {
    return new ApiResponse({ statusCode, message, data: null });
  }
}

export default ApiResponse;
