import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '@common/auth/password.util';
import type { AppRole } from '@modules/roles/roles.constants';
import { UsersService } from '@modules/users/users.service';
import type { AuthResponse, AuthenticatedUser, JwtPayload } from './auth.types';
import type { LoginInput } from './schemas/login.schema';
import type { RegisterInput } from './schemas/register.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException({
        error: 'CONFLICT',
        message: 'Email is already registered',
      });
    }

    const createdUser = await this.usersService.createLocalUser({
      email: input.email,
      name: input.name,
      password: input.password,
    });

    return this.createAuthResponse({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      roles: createdUser.roles,
      isActive: createdUser.isActive,
    });
  }

  async validateLocalUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersService.findAuthUserByEmail(email);
    if (!user || !user.passwordHash) {
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

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse>;
  async login(input: AuthenticatedUser): Promise<AuthResponse>;
  async login(input: AuthenticatedUser | LoginInput): Promise<AuthResponse> {
    if ('password' in input) {
      const authenticatedUser = await this.validateLocalUser(
        input.email,
        input.password,
      );
      return this.createAuthResponse(authenticatedUser);
    }

    return this.createAuthResponse(input);
  }

  async validateGoogleUser(input: {
    googleId: string;
    email: string;
    name: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.usersService.upsertGoogleUser(input);
    if (!user.isActive) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User is inactive',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive,
    };
  }

  async getMe(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    roles: AppRole[];
  }> {
    const user = await this.usersService.findProfileById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User not found or inactive',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
  }

  private createAuthResponse(user: AuthenticatedUser): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }
}
