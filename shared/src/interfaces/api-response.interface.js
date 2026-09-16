/**
 * Standard API Response Format
 */
class ApiResponse {
  static success(data = null, message = 'Success', meta = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
    if (errors) {
      response.errors = errors;
    }
    return response;
  }
}

module.exports = { ApiResponse };
