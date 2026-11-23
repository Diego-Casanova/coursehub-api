import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '../../auth/jwt/jwt-payload.interface';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<AuthenticatedRequest>();
    const response = context.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : isHttpException
          ? exception.getResponse()
          : 'Internal server error';

    if (exception instanceof ForbiddenException) {
      this.logger.warn(
        JSON.stringify({
          event: 'authorization_denied',
          actorId: request.user?.id ?? null,
          actorRole: request.user?.role ?? null,
          method: request.method,
          path: request.path,
          statusCode: status,
          timestamp: new Date().toISOString(),
        }),
      );
    } else if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({
          event: 'http_error',
          method: request.method,
          path: request.path,
          statusCode: status,
          timestamp: new Date().toISOString(),
        }),
      );
    }

    response.status(status).json({
      statusCode: status,
      path: request.path,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
