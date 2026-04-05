import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves profile data for the authenticated user.',
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
