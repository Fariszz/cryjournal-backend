import { Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from '../../common/auth/cookie.util';
import { hashPassword, verifyPassword } from '../../common/auth/password.util';
import { signJwt } from '../../common/auth/jwt.util';
import { env } from '../../common/config/env';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { users } from '../../db/schema';
import { UsersService } from '../users/users.service';
import type { FastifyReply } from 'fastify';

const MINUTE_MS = 60_000;

@Injectable()
export class AuthService {
  constructor(
    @InjectDb() private readonly db: DB,
    private readonly usersService: UsersService,
  ) {}

  async login(
    email: string,
    password: string,
    reply: FastifyReply,
  ): Promise<{ id: string; email: string; name: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
    if (!user.isActive) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User is inactive',
      });
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new UnauthorizedException({
        error: 'ACCOUNT_LOCKED',
        message: 'Account is temporarily locked',
      });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockReached = attempts >= env.LOGIN_MAX_ATTEMPTS;
      await this.db
        .update(users)
        .set({
          failedLoginAttempts: lockReached ? 0 : attempts,
          lockedUntil: lockReached
            ? new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * MINUTE_MS)
            : null,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const accessToken = signJwt(
      { sub: user.id, email: user.email },
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_TTL_SECONDS,
    );
    const refreshToken = signJwt(
      { sub: user.id, email: user.email },
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_TTL_SECONDS,
    );
    const refreshTokenHash = await hashPassword(refreshToken);

    await this.db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        refreshTokenHash,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    this.setAuthCookies(reply, accessToken, refreshToken);
    return { id: user.id, email: user.email, name: user.name };
  }

  async logout(
    userId: string,
    reply: FastifyReply,
  ): Promise<{ success: true }> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    this.clearAuthCookies(reply);
    return { success: true };
  }

  async getMe(
    userId: string,
  ): Promise<{ id: string; email: string; name: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  private setAuthCookies(
    reply: FastifyReply,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = env.NODE_ENV === 'production';
    reply.setCookie(ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: env.JWT_ACCESS_TTL_SECONDS,
    });
    reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: env.JWT_REFRESH_TTL_SECONDS,
    });
  }

  private clearAuthCookies(reply: FastifyReply): void {
    reply.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
    reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
  }
}
