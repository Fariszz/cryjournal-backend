import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>(
        'GOOGLE_CLIENT_ID',
        'replace-google-client-id',
      ),
      clientSecret: configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
        'replace-google-client-secret',
      ),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/api/v1/auth/google/callback',
      ),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<RequestUser> {
    const primaryEmail = profile.emails?.[0]?.value?.toLowerCase();
    if (!primaryEmail) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Google account does not expose an email address',
      });
    }

    const normalizedName = profile.displayName?.trim() || primaryEmail;
    const user = await this.authService.validateGoogleUser({
      googleId: profile.id,
      email: primaryEmail,
      name: normalizedName,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }
}
