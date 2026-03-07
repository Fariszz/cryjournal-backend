import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type RequestUser,
} from '@common/auth/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: RequestUser | undefined) {
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }

    const data = await this.usersService.findProfileById(user.id);
    if (!data) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authenticated user no longer exists',
      });
    }

    return { data };
  }
}
