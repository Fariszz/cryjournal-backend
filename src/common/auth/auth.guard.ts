import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { env } from '../config/env';
import { ACCESS_COOKIE_NAME, parseCookieHeader } from './cookie.util';
import { verifyJwt } from './jwt.util';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: { id: string; email: string };
    }>();
    const cookies = parseCookieHeader(req.headers.cookie);
    const token = cookies[ACCESS_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Missing access token',
      });
    }

    try {
      const payload = verifyJwt(token, env.JWT_ACCESS_SECRET);
      req.user = {
        id: String(payload.sub),
        email: String(payload.email),
      };
      return true;
    } catch {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Invalid access token',
      });
    }
  }
}
