import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { InjectDb } from '../../db/db.provider';
import type { DB } from '../../db/client';
import { users } from '../../db/schema';

export type UserEntity = typeof users.$inferSelect;

@Injectable()
export class UsersService {
  constructor(@InjectDb() private readonly db: DB) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user ?? null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }
}
