import {
  BadRequestException,
  Body,
  CallHandler,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Module,
  NestInterceptor,
  Post,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { map, Observable } from 'rxjs';
import request from 'supertest';

interface CreateUserInput {
  email: string;
  name: string;
}

interface UserEntity {
  id: string;
  email: string;
  name: string;
}

@Injectable()
class UsersMemoryService {
  private readonly users: UserEntity[] = [];

  createUser(input: CreateUserInput): UserEntity {
    const user: UserEntity = {
      id: `user-${this.users.length + 1}`,
      email: input.email,
      name: input.name,
    };
    this.users.push(user);
    return user;
  }

  listUsers(): UserEntity[] {
    return [...this.users];
  }
}

@Injectable()
class CreateUserValidationPipe {
  transform(value: unknown): CreateUserInput {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Body must be an object',
      });
    }
    const payload = value as Partial<CreateUserInput>;
    const hasValidEmail =
      typeof payload.email === 'string' && payload.email.includes('@');
    const hasValidName =
      typeof payload.name === 'string' && payload.name.trim().length >= 2;
    if (!hasValidEmail || !hasValidName) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'email and name are required',
      });
    }
    return {
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim(),
    };
  }
}

@Injectable()
class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
    }>();
    const authorization = request.headers.authorization ?? '';
    if (authorization !== 'Bearer test-token') {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Authentication is required',
      });
    }
    return true;
  }
}

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    void context;
    return next.handle().pipe(
      map((value: unknown) => ({
        data: value,
        meta: {
          intercepted: true,
        },
      })),
    );
  }
}

@Controller('users')
@UseGuards(TestAuthGuard)
@UseInterceptors(LoggingInterceptor)
class TestUsersController {
  constructor(private readonly usersService: UsersMemoryService) {}

  @Post()
  createUser(@Body(new CreateUserValidationPipe()) body: CreateUserInput) {
    return this.usersService.createUser(body);
  }

  @Get()
  listUsers() {
    return this.usersService.listUsers();
  }
}

@Module({
  controllers: [TestUsersController],
  providers: [UsersMemoryService, TestAuthGuard, LoggingInterceptor],
})
class UsersE2eModule {}

describe('Users E2E', () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersE2eModule],
    }).compile();
    app = moduleFixture.createNestApplication<INestApplication<Server>>();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /users returns user list when authenticated', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer test-token')
      .expect(200)
      .expect({
        data: [],
        meta: {
          intercepted: true,
        },
      });
  });

  it('POST /users creates a user when payload is valid', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer test-token')
      .send({
        email: 'NewUser@example.com',
        name: 'New User',
      })
      .expect(201)
      .expect({
        data: {
          id: 'user-1',
          email: 'newuser@example.com',
          name: 'New User',
        },
        meta: {
          intercepted: true,
        },
      });
  });

  it('POST /users returns validation error when payload is invalid', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer test-token')
      .send({
        email: 'invalid',
        name: 'A',
      })
      .expect(400);
  });
});
