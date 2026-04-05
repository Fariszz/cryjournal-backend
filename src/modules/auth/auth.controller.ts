import {
  Body,
  Controller,
  Get,
  HttpCode,
  Request,
  Post,
  UseGuards,
  UnauthorizedException,
  Logger,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { ZodValidationPipe } from '@common/validation/zod-validation.pipe';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { RegisterInput } from './schemas/register.schema';
import { registerSchema } from './schemas/register.schema';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register user account',
    description: 'Creates a new user account using email and password.',
  })
  @ApiCreatedResponse({
    description: 'User account registered successfully.',
    schema: {
      example: {
        data: {
          id: '2ce9ec65-2dcd-4474-85f9-84f941410814',
          email: 'trader@example.com',
          name: 'Ari Putra',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request payload is invalid.' })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterInput) {
    const data = await this.authService.register(body);
    return { data };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticates a user and returns access token data.',
  })
  @ApiOkResponse({
    description: 'User authenticated successfully.',
    schema: {
      example: {
        data: {
          user: {
            id: '2ce9ec65-2dcd-4474-85f9-84f941410814',
            email: 'trader@example.com',
            name: 'Ari Putra',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 3600,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User credentials are invalid.' })
  async login(@CurrentUser() user: RequestUser | undefined) {
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
  @ApiOperation({
    summary: 'Start Google OAuth login',
    description: 'Redirects to Google OAuth consent screen.',
  })
  @ApiOkResponse({ description: 'OAuth redirect was initiated.' })
  googleLogin(): void {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({
    summary: 'Handle Google OAuth callback',
    description: 'Handles Google callback and returns login token payload.',
  })
  @ApiOkResponse({
    description: 'Google OAuth login completed successfully.',
    schema: {
      example: {
        data: {
          user: {
            id: '2ce9ec65-2dcd-4474-85f9-84f941410814',
            email: 'trader@example.com',
            name: 'Ari Putra',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 3600,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Google authentication failed.' })
  async googleCallback(
    @Request()
    request: ExpressRequest & {
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
  @ApiOperation({
    summary: 'Logout current user',
    description: 'Logs out the authenticated user session.',
  })
  @ApiOkResponse({
    description: 'User logged out successfully.',
    schema: {
      example: {
        data: {
          success: true,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  async logout(@CurrentUser() user: RequestUser | undefined) {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }

    await this.authService.logout(user.id);
    return { data: { success: true } };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns authenticated user profile details.',
  })
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully.',
    schema: {
      example: {
        data: {
          id: '2ce9ec65-2dcd-4474-85f9-84f941410814',
          email: 'trader@example.com',
          name: 'Ari Putra',
          roles: ['TRADER'],
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
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
