import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message;

    const errors = typeof exceptionResponse === 'object' && (exceptionResponse as any).message
      ? (exceptionResponse as any).message
      : message;

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(errors) ? errors : message,
      errors: Array.isArray(errors) ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
