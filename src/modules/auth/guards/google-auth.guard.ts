import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { env } from '@common/config/env';
import { resolveOAuthRedirectOrigin } from '@common/http/allowed-origins.util';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): { state?: string } {
    const request = context.switchToHttp().getRequest<Request>();
    const isCallbackRoute = request.path.endsWith('/google/callback');
    if (isCallbackRoute) {
      return {};
    }
    const redirectOriginQuery = request.query.redirectOrigin;
    const requestedOrigin =
      typeof redirectOriginQuery === 'string'
        ? redirectOriginQuery
        : undefined;
    const resolvedOrigin = resolveOAuthRedirectOrigin(
      requestedOrigin,
      env.CORS_ALLOWED_ORIGINS,
    );
    return { state: resolvedOrigin };
  }
}
