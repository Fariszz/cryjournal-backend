import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { RequestUser } from '@common/auth/current-user.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    });
  }

  async validate(email: string, password: string): Promise<RequestUser> {
    if (!email || !password) {
      throw new UnauthorizedException({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      });
    }

    const user = await this.authService.validateLocalUser(email, password);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }
}
