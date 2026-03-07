import {
  Body,
  Controller,
  Get,
  HttpCode,
  Request,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { LoginInput } from './schemas/login.schema';
import { loginSchema } from './schemas/login.schema';
import type { RegisterInput } from './schemas/register.schema';
import { registerSchema } from './schemas/register.schema';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
  ) {
    const data = await this.authService.register(body);
    return { data };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) _body: LoginInput,
    @CurrentUser() user: RequestUser | undefined,
  ) {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Unable to authenticate user credentials',
      });
    }

    const data = await this.authService.login({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isActive: true,
    });
    return { data };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin(): void {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Request()
    request: FastifyRequest & {
      user?: RequestUser;
    },
  ) {
    if (!request.user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Google authentication failed',
      });
    }

    const data = await this.authService.login({
      id: request.user.id,
      email: request.user.email,
      name: request.user.name,
      roles: request.user.roles,
      isActive: true,
    });
    return { data };
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  logout() {
    return { data: { success: true } };
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() user: RequestUser | undefined) {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }

    const data = await this.authService.getMe(user.id);
    return { data };
  }
}
