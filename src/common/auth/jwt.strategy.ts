import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '@common/auth/auth-cookie.util';
import { hashAccessToken } from '@common/auth/access-token.util';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { UsersService } from '@modules/users/users.service';
import type { JwtPayload } from '@modules/auth/auth.types';

function extractAccessTokenFromCookie(req: Request): string | null {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (typeof token !== 'string' || token.length === 0) {
    return null;
  }
  return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAccessTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'local-jwt-secret-change-me',
      ),
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const user = await this.usersService.findAuthUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User account is invalid or inactive',
      });
    }

    const accessToken = this.extractToken(req);
    if (!accessToken || !user.refreshTokenHash) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Session has expired or been logged out',
      });
    }

    const incomingTokenHash = hashAccessToken(accessToken);
    if (incomingTokenHash !== user.refreshTokenHash) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Session has expired or been logged out',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }

  private extractToken(req: Request): string | null {
    const cookieToken = extractAccessTokenFromCookie(req);
    if (cookieToken) {
      return cookieToken;
    }
    return this.extractBearerToken(req);
  }

  private extractBearerToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }
}
