import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';
import { ACCESS_TOKEN_COOKIE } from '@common/auth/auth-cookie.util';

interface OptionalAuthRequestHeaders {
  authorization?: string;
}

interface OptionalAuthRequest {
  headers?: OptionalAuthRequestHeaders;
  cookies?: Record<string, string | undefined>;
}

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthRequest | undefined>();
    const hasAuthorizationHeader = Boolean(request?.headers?.authorization);
    const hasAccessTokenCookie = Boolean(
      request?.cookies?.[ACCESS_TOKEN_COOKIE],
    );
    if (!hasAuthorizationHeader && !hasAccessTokenCookie) {
      return true;
    }
    return super.canActivate(context);
  }
}
