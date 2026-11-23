import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '../../auth/jwt/jwt-payload.interface';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
  route?: { path?: string };
};

@Catch(ForbiddenException)
export class AuthorizationAuditFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthorizationAuditFilter.name);

  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<AuthenticatedRequest>();
    const response = context.getResponse<Response>();
    const event = {
      event: 'authorization_denied',
      actorId: request.user?.id ?? null,
      actorRole: request.user?.role ?? null,
      method: request.method,
      path: request.route?.path ?? request.path,
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(JSON.stringify(event));
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
