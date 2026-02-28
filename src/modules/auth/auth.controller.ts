import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto, loginSchema } from './auth.schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const data = await this.authService.login(body.email, body.password, reply);
    return { data };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const data = await this.authService.logout(user.id, reply);
    return { data };
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    const data = await this.authService.getMe(user.id);
    return { data };
  }
}
