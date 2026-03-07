import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';

interface OptionalAuthRequestHeaders {
  authorization?: string;
}

interface OptionalAuthRequest {
  headers?: OptionalAuthRequestHeaders;
}

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthRequest | undefined>();

    if (!request?.headers?.authorization) {
      return true;
    }

    return super.canActivate(context);
  }
}
