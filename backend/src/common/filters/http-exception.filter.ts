import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Validation');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log detailed info if it's a validation error
    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as unknown as { message: string }).message &&
      Array.isArray(
        (exceptionResponse as unknown as { message: string }).message,
      )
    ) {
      this.logger.warn(
        `Validation failed for ${request.method} ${request.url}: ${JSON.stringify(
          (exceptionResponse as unknown as { message: string }).message,
        )}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as unknown as { message: string }).message,
    });
  }
}
