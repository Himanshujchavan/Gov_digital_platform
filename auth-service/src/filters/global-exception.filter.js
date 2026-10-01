const { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } = require('@nestjs/common');
const { ApiResponse } = require('@maha-interop/shared');

@Catch()
class GlobalExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : exceptionResponse.message || 'An unexpected error occurred';

    const errorResponse = ApiResponse.error(
      message,
      `Error occurred at ${request.url}`,
      status
    );

    response.status(status).json(errorResponse);
  }
}

module.exports = { GlobalExceptionFilter };
